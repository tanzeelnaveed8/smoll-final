import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Member } from 'src/modules/member/member.entity';
import { Pet } from 'src/modules/pet/entities/pet.entity';
import { StripeService } from 'src/modules/stripe/stripe.service';
import { DataSource, MoreThanOrEqual, Repository } from 'typeorm';
import { SmollCareBenefit } from '../entities/smoll-care-benefit.entity';
import { SmollCareSubscription } from '../entities/smoll-care-subscription.entity';
import { SmollCarePlan } from '../entities/smoll-care-plan.entity';
import { SubscriptionStatus } from '../enums/subscription-status.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { Logger } from '../../../configs/logger';
import { PetService } from 'src/modules/pet/services/pet.service';
import { Plan } from '../enums/smollcare-plan.enum';
import { PetSpeciesEnum } from 'src/modules/pet/pet-species.enum';

@Injectable()
export class SmollCareMemberService {
  private readonly logger = Logger.getInstance();

  constructor(
    private stripeService: StripeService,
    private dataSource: DataSource,

    @InjectRepository(SmollCareBenefit)
    private smollCareBenefitRepository: Repository<SmollCareBenefit>,

    @InjectRepository(SmollCarePlan)
    private smollCarePlanRepo: Repository<SmollCarePlan>,

    @InjectRepository(Pet)
    private petRepository: Repository<Pet>,
  ) {}

  async createSubscription(petId: string, memberId: string, coupon?: string) {
    return this.dataSource.transaction(async (transactionalEntityManager) => {
      const pet = await transactionalEntityManager.findOne(Pet, {
        where: { id: petId },
      });

      if (!pet) {
        this.logger.error(`Pet with ID ${petId} not found.`);
        throw new NotFoundException('Pet with ID not found.');
      }

      let planId: number;
      if (pet.species === PetSpeciesEnum.CAT) {
        planId = Plan.FELINE;
      } else {
        planId = Plan.CANINE;
      }

      const plan = await transactionalEntityManager.findOne(SmollCarePlan, {
        where: { id: planId },
      });

      if (!plan) {
        this.logger.error(`Smoll Care Plan with ID ${planId} not found.`);
        throw new NotFoundException(
          `Smoll Care Plan with ID ${planId} not found.`,
        );
      }

      const member = await transactionalEntityManager.findOne(Member, {
        where: { id: memberId },
      });

      if (!member || !member.stripeCustomerId) {
        this.logger.error(
          `Member with ID ${memberId} not found or Stripe customer ID is missing.`,
        );
        throw new NotFoundException(
          `Member with ID ${memberId} not found or Stripe customer ID is missing.`,
        );
      }

      return await this.stripeService.createSmollCareSubscription(
        member.stripeCustomerId,
        plan.stripePriceId,
        {
          memberId,
          petId,
          type: 'pet_subscription',
        },
        coupon,
      );
    });
  }

  async createMockSubscription(petId: string, planId: number) {
    return this.dataSource.transaction(async (transactionalEntityManager) => {
      const plan = await transactionalEntityManager.findOne(SmollCarePlan, {
        where: { id: planId },
      });
      if (!plan) {
        throw new NotFoundException(
          `Smoll Care Plan with ID ${planId} not found.`,
        );
      }

      const pet = await transactionalEntityManager.findOne(Pet, {
        where: { id: petId },
        relations: ['owner'],
      });
      if (!pet) {
        throw new NotFoundException(`Pet with ID ${petId} not found.`);
      }

      const existingSubscription = await transactionalEntityManager.findOne(
        SmollCareSubscription,
        {
          where: {
            pet: {
              id: petId,
            },
            status: SubscriptionStatus.ACTIVE,
            plan: {
              id: planId,
            },
          },
        },
      );
      if (existingSubscription) {
        throw new BadRequestException(
          'Subscription for the pet already existing',
        );
      }

      // Generate unique careId for pet
      const ownerCareIdRaw = (pet.owner?.careId || '').toString();
      const numericOwnerId = ownerCareIdRaw
        .replace(/\D/g, '')
        .padStart(6, '0')
        .slice(0, 6);
      const species = pet.species?.toLowerCase();
      const speciesMarker =
        species === 'cat' ? 'C' : species === 'dog' ? 'F' : 'X';

      let uniqueCareId: string;
      let exists = true;
      let attempts = 0;
      while (exists && attempts < 10) {
        const randomNN = Math.floor(Math.random() * 100)
          .toString()
          .padStart(2, '0');
        uniqueCareId = `${numericOwnerId.slice(0, 3)}-${numericOwnerId.slice(3, 6)}-${speciesMarker}${randomNN}`;

        const existingPet = await transactionalEntityManager.findOne(Pet, {
          where: { careId: uniqueCareId },
        });
        exists = !!existingPet;
        attempts++;
      }

      if (exists) {
        this.logger.error(
          `Failed to generate unique careId after ${attempts} attempts.`,
        );
        throw new Error('Could not generate unique pet careId');
      }

      // Update and save pet with careId
      pet.careId = uniqueCareId;
      await transactionalEntityManager.save(Pet, pet);

      const now = new Date();
      let endDate: Date;

      // Calculate endDate based on plan.cycle
      switch (plan.cycle) {
        case 'Monthly':
          endDate = new Date(now);
          endDate.setMonth(endDate.getMonth() + 1);
          break;
        case 'Yearly':
          endDate = new Date(now);
          endDate.setFullYear(endDate.getFullYear() + 1);
          break;
        default:
          endDate = new Date(now);
          endDate.setMonth(endDate.getMonth() + 1); // default to monthly
          break;
      }

      const subscription = transactionalEntityManager.create(
        SmollCareSubscription,
        {
          pet: pet,
          plan: plan,
          startDate: now,
          endDate: endDate,
          status: SubscriptionStatus.ACTIVE,
        },
      );
      const savedSubscription = await transactionalEntityManager.save(
        SmollCareSubscription,
        subscription,
      );

      return savedSubscription;
    });
  }

  async findPlanBenefits(petId: string) {
    const pet = await this.petRepository.findOne({
      where: { id: petId },
    });

    if (!pet) {
      this.logger.error(`Pet with ID ${petId} not found.`);
      throw new NotFoundException(`Pet with the Id ${petId} not found`);
    }

    let planId: number;

    if (pet.species === PetSpeciesEnum.CAT) {
      planId = Plan.FELINE;
    } else {
      planId = Plan.CANINE;
    }

    const plan = await this.smollCarePlanRepo.findOne({
      where: {
        id: planId,
      },
    });

    if (!plan) {
      this.logger.error(`Smoll Care Plan with ID ${planId} not found.`);

      throw new NotFoundException(
        `Smoll Care Plan with ID ${planId} not found.`,
      );
    }

    const planBenefits = await this.smollCareBenefitRepository.find({
      where: {
        plan: {
          id: planId,
        },
      },
    });

    if (!planBenefits || planBenefits.length === 0) {
      this.logger.error(`Benefits with planId ${planId} not found.`);
      throw new NotFoundException(`Benefits with planId ${planId} not found.`);
    }

    return {
      benefits: [...planBenefits],
      price: plan.price,
    };
  }

  async findUsedBenefits(petId: string) {
    return this.dataSource.transaction(async (transactionalEntityManager) => {
      const today = new Date();
      const subscription = await transactionalEntityManager.findOne(
        SmollCareSubscription,
        {
          where: {
            pet: { id: petId },
            status: SubscriptionStatus.ACTIVE,
            endDate: MoreThanOrEqual(today),
          },
          relations: ['benefitUsages', 'plan', 'plan.benefits'],
        },
      );
      if (!subscription) {
        throw new Error('No active subscription found for the pet.');
      }

      const planBenefits = subscription.plan.benefits;
      const useBenefits = subscription.benefitUsages;

      // Group usages by benefitId for quick lookup
      const usageMap = new Map<number, number>();
      for (const usage of useBenefits) {
        const benefitId = usage.benefitId;
        usageMap.set(benefitId, (usageMap.get(benefitId) || 0) + 1);
      }

      // Build final list
      const result = planBenefits.map((benefit) => ({
        benefitId: benefit.id,
        benefitName: benefit.name,
        totalAllowed: benefit.maxUsagePerSubscription,
        timesUsed: usageMap.get(benefit.id) || 0,
      }));

      return result;
    });
  }
}
