import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationResult, paginate } from 'src/utils/pagination';
import { FindManyOptions, ILike, IsNull, Repository } from 'typeorm';
import { Case } from '../case.entity';
import { FindAllCasesAdminQueryDto } from '../dto/find.admin.dto';
import { SubscriptionStatus } from 'src/modules/smollcare/enums/subscription-status.enum';
import { CaseStatusEnum } from '../enums/case-status.enum';
import { Member } from 'src/modules/member/member.entity';
import { Pet } from 'src/modules/pet/entities/pet.entity';
import { Vet } from 'src/modules/vet/entities/vet.entity';

@Injectable()
export class CaseAdminService {
  constructor(
    @InjectRepository(Case)
    private readonly caseRepo: Repository<Case>,
    @InjectRepository(Member)
    private readonly memberRepo: Repository<Member>,
    @InjectRepository(Pet)
    private readonly petRepo: Repository<Pet>,
    @InjectRepository(Vet)
    private readonly vetRepo: Repository<Vet>,
  ) {}

  async findAll(
    query: FindAllCasesAdminQueryDto,
  ): Promise<PaginationResult<Case>> {
    const { search, ...pageQuery } = query;

    const searchQuery = search ? ILike(`%${search}%`) : undefined;
    const where = search
      ? [
          {
            vetConsultation: IsNull(),
            pet: { name: searchQuery },
          },
          {
            vetConsultation: IsNull(),
            member: { name: searchQuery },
          },
        ]
      : { vetConsultation: IsNull() };

    const findOptions: FindManyOptions<Case> = {
      relations: {
        member: true,
        pet: true,
        assignedVet: true,
      },
      where: where as any,
      select: {
        id: true,
        member: { name: true },
        pet: { name: true },
        createdAt: true,
        scheduledAt: true,
        status: true,
        serviceChecklist: true as any,
      } as any,
      order: {
        createdAt: 'DESC',
      },
    };

    return paginate(this.caseRepo, pageQuery, findOptions);
  }

  async findOne(id: string) {
    const _case = await this.caseRepo.findOne({
      where: {
        id,
        vetConsultation: IsNull(),
      },
      relations: {
        member: true,
        pet: {
          subscription: {
            benefitUsages: {
              partner: true,
            },
            plan: {
              benefits: true,
            },
          },
        },
        assignedVet: true,
        partnerBooking: true,
        partnerCosts: true,
      },
    });

    if (!_case) {
      throw new NotFoundException(`Case with id ${id} not found`);
    }

    const pet = _case.pet;
    const today = new Date();

    let subscriptionDetails = null;
    let benefitUsageSummary = [];

    if (
      pet.subscription &&
      pet.subscription.endDate >= today &&
      pet.subscription.status !== SubscriptionStatus.REVOKED
    ) {
      subscriptionDetails = {
        status: pet.subscription.status,
        startDate: pet.subscription.startDate,
        endDate: pet.subscription.endDate,
      };

      const { plan, benefitUsages = [] } = pet.subscription;

      benefitUsageSummary = (plan?.benefits || []).map((benefit) => {
        const usageLogs = benefitUsages.filter(
          (log) => log.benefitId === benefit.id,
        );

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
      });
    }

    return {
      ..._case,
      pet: {
        ...pet,
        subscriptionDetails,
        benefitUsageSummary,
      },
    };
  }

  async addNote(id: string, note: string, author: string): Promise<Case> {
    const _case = await this.caseRepo.findOne({ where: { id } });
    if (!_case) {
      throw new NotFoundException(`Case with id ${id} not found`);
    }
    const notes = _case.notes ?? [];
    notes.push({ note, author, createdAt: new Date().toISOString() });
    _case.notes = notes;
    return this.caseRepo.save(_case);
  }

  async cancelCase(id: string): Promise<Case> {
    const _case = await this.caseRepo.findOne({ where: { id } });
    if (!_case) {
      throw new NotFoundException(`Case with id ${id} not found`);
    }
    _case.status = CaseStatusEnum.CONFIRMED;
    return this.caseRepo.save(_case);
  }

  async createCase(data: {
    memberId: string;
    petId: string;
    vetId: string;
    description: string;
    scheduledAt?: Date;
  }): Promise<Case> {
    const member = await this.memberRepo.findOne({ where: { id: data.memberId } });
    if (!member) throw new NotFoundException(`Member with id ${data.memberId} not found`);

    const pet = await this.petRepo.findOne({ where: { id: data.petId } });
    if (!pet) throw new NotFoundException(`Pet with id ${data.petId} not found`);

    const vet = await this.vetRepo.findOne({ where: { id: data.vetId } });
    if (!vet) throw new NotFoundException(`Vet with id ${data.vetId} not found`);

    const _case = this.caseRepo.create({
      description: data.description,
      scheduledAt: data.scheduledAt ?? null,
      member,
      pet,
      assignedVet: vet,
      status: CaseStatusEnum.PENDING,
    });

    return this.caseRepo.save(_case);
  }
}
