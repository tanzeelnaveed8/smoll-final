import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Pet } from '../entities/pet.entity';
import { In, MoreThanOrEqual, Repository } from 'typeorm';
import { CreatePetPayloadDto } from '../dto/create.dto';
import { UpdatePetPayloadDto } from '../dto/update.dto';
import { FindAllPetsQueryDto, FindOnePetResDto, FindPetWithCareResDto } from '../dto/find.dto';
import { plainToInstance } from 'class-transformer';
import { SmollCareSubscription } from 'src/modules/smollcare/entities/smoll-care-subscription.entity';
import { SubscriptionStatus } from 'src/modules/smollcare/enums/subscription-status.enum';

@Injectable()
export class PetService {
  constructor(
    @InjectRepository(Pet)
    private readonly petRepo: Repository<Pet>,
    // private benefitsUsageService: SmollCareBenefitService
    @InjectRepository(SmollCareSubscription)
    private petSubscriptionRepo: Repository<SmollCareSubscription>
  ) { }

  async findAll(userId: string, query: FindAllPetsQueryDto): Promise<Pet[]> {
    const { isDeceased } = query;

    const pets = await this.petRepo.find({
      where: { owner: { id: userId }, isDeceased },
      relations: ['subscription'],
    });

    const today = new Date()
    return pets.sort((a, b) => {
      const aSub = a.subscription;
      const bSub = b.subscription;

      const aScore = this.getSortScore(aSub, today);
      const bScore = this.getSortScore(bSub, today);

      return aScore - bScore;
    });
  }

  async findAllPetsByMemberId(userId: string): Promise<Pet[]> {
    const pets = await this.petRepo.find({
      where: { owner: { id: userId } },
      relations: ['subscription'],
    });

    return pets;
  }

  // Helper to assign sorting weight
  getSortScore(sub: { endDate: Date } | null | undefined, today: Date): number {
    if (sub && sub.endDate > today) return 0; // Active subscription – top
    if (sub) return 1;                        // Expired subscription – middle
    return 2;                                 // No subscription – bottom
  }

  async findOne(userId: string, petId: string) {

    const pet = await this.petRepo.findOne({
      where: { id: petId, owner: { id: userId } },
      relations: ['healthHistory'], // only load basic direct relations
    });

    if (!pet) {
      throw new NotFoundException(`Pet with id "${petId}" not found`);
    }

    // Load subscription separately
    const today = new Date()
    const subscription = await this.petSubscriptionRepo.findOne({
      where: { pet: { id: petId }, status: In([SubscriptionStatus.ACTIVE, SubscriptionStatus.CANCELED]), endDate: MoreThanOrEqual(today) },
      relations: ['plan', 'plan.benefits', 'benefitUsages', 'benefitUsages.partner'],
    });

    // Prepare subscription detail (null-safe)
    const subscriptionDetails = subscription
      ? {
        status: subscription.status,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
      }
      : null;

    // Prepare benefits (safe chaining)
    const benefits = subscription?.plan?.benefits?.map((benefit) => {
      const usageLogs =
        subscription.benefitUsages?.filter(
          (log) => log.benefitId === benefit.id,
        ) || [];

      return {
        id: benefit.id,
        name: benefit.name,
        totalUsageCount: benefit.maxUsagePerSubscription,
        consumedUsageCount: usageLogs.length,
        history: usageLogs.map((log) => ({
          partnerId: log.partner?.id || null,
          clinicName: log.partner?.name || '',
          note: log.note,
          vet: log.vet,
          createdAt: log.createdAt,
        })),
      };
    }) || [];

    const petDetails = {
      ...pet,
      careId: subscription ? pet.careId : null
    }

    const transformedPet = plainToInstance(FindOnePetResDto, petDetails, {
      excludeExtraneousValues: true,
    });

    return {
      ...transformedPet,
      subscriptionDetails,
      benefits,
    };
  }

  async create(userId: string, body: CreatePetPayloadDto): Promise<Pet> {
    const pet = this.petRepo.create({ ...body, owner: { id: userId } });
    return this.petRepo.save(pet);
  }

  async update(
    userId: string,
    id: string,
    body: UpdatePetPayloadDto,
  ): Promise<Pet> {
    const pet = await this.petRepo.findOne({
      where: { id, owner: { id: userId } },
    });

    if (!pet) {
      throw new NotFoundException(`Pet with id "${id}" not found`);
    }

    return this.petRepo.save({ ...pet, ...body });
  }

  async delete(userId: string, id: string): Promise<void> {
    const pet = await this.findOne(userId, id);
    await this.petRepo.softRemove(pet);
  }
}
