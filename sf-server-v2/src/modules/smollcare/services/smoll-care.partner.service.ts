import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UseBenefitDto } from '../dto/use-benefit.dto';
import { Repository, DataSource, MoreThanOrEqual, In, ILike } from 'typeorm';
import { SmollCareBenefit } from '../entities/smoll-care-benefit.entity';
import { SmollCareBenefitUsage } from '../entities/smoll-care-benefit-usage.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthUser } from 'src/decorators/get-user.decorator';
import { SmollCareSubscription } from '../entities/smoll-care-subscription.entity';
import { SubscriptionStatus } from '../enums/subscription-status.enum';

@Injectable()
export class SmollCarePartnerService {
  constructor(
    @InjectRepository(SmollCareSubscription)
    private SubscriptionRepo: Repository<SmollCareSubscription>,
    private readonly dataSource: DataSource,
  ) { }

  async findPetWithCare(careId: string) {

    const today = new Date();
    const subscription = await this.SubscriptionRepo.findOne({
      where: {
        pet: { careId: ILike(careId) },
        status: In([SubscriptionStatus.ACTIVE, SubscriptionStatus.CANCELED]),
        endDate: MoreThanOrEqual(today),
      },
      relations: [
        'pet',
        'plan',
        'plan.benefits',
        'benefitUsages',
        'benefitUsages.benefit',
        'benefitUsages.partner',
      ],
    });

    if (!subscription) {
      throw new NotFoundException('No active subscription/pet found for the CareId.');
    }

    const pet = subscription.pet;
    const planBenefits = subscription.plan.benefits;
    const usages = subscription.benefitUsages;

    // Group usage by benefit ID
    const usageMap = new Map<
      number,
      {
        consumedUsageCount: number;
        history: {
          partnerId: string;
          clinicName: string;
          note: string;
          vet: string;
          createdAt: string;
        }[];
      }
    >();

    for (const usage of usages) {
      const benefitId = usage.benefit.id;

      if (!usageMap.has(benefitId)) {
        usageMap.set(benefitId, {
          consumedUsageCount: 0,
          history: [],
        });
      }

      const entry = usageMap.get(benefitId)!;
      entry.consumedUsageCount++;
      entry.history.push({
        partnerId: usage.partner?.id ?? '',
        clinicName: usage.partner?.name ?? '',
        note: usage.note ?? '',
        vet: usage.vet,
        createdAt: usage.createdAt.toISOString(),
      });
    }

    // Final response
    const benefits = planBenefits.map((benefit) => {
      const usage = usageMap.get(benefit.id);

      return {
        id: benefit.id,
        name: benefit.name,
        totalUsageCount: benefit.maxUsagePerSubscription,
        consumedUsageCount: usage?.consumedUsageCount ?? 0,
        history:
          usage?.history.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          ) ?? [],
      };
    });

    return {
      pet: {
        id: pet.id,
        name: pet.name,
        age: pet.age,
        weight: pet.weight,
        species: pet.species,
        gender: pet.gender,
        breed: pet.breed,
        spayedOrNeutered: pet.spayedOrNeutered,
        careId: pet.careId,
        photos: pet.photos,
        subscription: {
          status: subscription.status,
          endDate: subscription.endDate,
        },
      },
      benefits,
    };
  }

  async useBenefit(useBenefitDto: UseBenefitDto, user: AuthUser) {
    const { petId, caseId, benefits } = useBenefitDto;
    const partnerId = user.id;
    const today = new Date();
    const errors: any[] = [];

    return this.dataSource.transaction(async (transactionalEntityManager) => {
      const subscription = await transactionalEntityManager.findOne(
        SmollCareSubscription,
        {
          where: {
            pet: {
              id: petId
            },
            status: In([SubscriptionStatus.ACTIVE, SubscriptionStatus.CANCELED]),
            endDate: MoreThanOrEqual(today),
          },
          relations: ['pet', 'plan'],
        },
      );

      if (!subscription || !subscription.plan) {
        throw new NotFoundException(
          `Subscription for Pet ID ${petId} or its related plan not found.`,
        );
      }

      if (new Date() > new Date(subscription.endDate)) {
        throw new BadRequestException('Subscription has expired.');
      }

      const subscriptionId = subscription.id;
      const savedUsages: SmollCareBenefitUsage[] = [];

      for (const benefit of benefits) {
        const { benefitId, note, vet } = benefit;
        try {
          const benefit = await transactionalEntityManager.findOne(
            SmollCareBenefit,
            {
              where: { id: benefitId },
              relations: ['plan'],
            },
          );

          if (!benefit) {
            throw new NotFoundException(
              `Benefit with ID ${benefitId} not found.`,
            );
          }

          if (subscription.plan.id !== benefit.plan.id) {
            throw new ForbiddenException(
              "This benefit is not applicable to the license's subscription plan.",
            );
          }

          const usageCount = await transactionalEntityManager.count(
            SmollCareBenefitUsage,
            {
              where: { subscription: { id: subscriptionId }, benefitId },
            },
          );

          if (
            benefit.maxUsagePerSubscription !== null &&
            usageCount >= benefit.maxUsagePerSubscription
          ) {
            throw new ForbiddenException(
              `Benefit usage quota of ${benefit.maxUsagePerSubscription} per subscription reached.`,
            );
          }

          const newUsage = transactionalEntityManager.create(
            SmollCareBenefitUsage,
            {
              subscription,
              benefitId,
              benefit,
              note,
              vet,
              partner: {
                id: partnerId
              },
              case: {
                id: caseId
              }
            },
          );

          const saved = await transactionalEntityManager.save(
            SmollCareBenefitUsage,
            newUsage,
          );
          savedUsages.push(saved);
        } catch (error) {
          errors.push({ benefitId, error: error.message || 'Unknown error' });
          continue;
        }
      }

      return {
        message: 'Benefit processing complete',
        savedUsages,
        errors,
      };
    });
  }
}
