import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, ILike, Repository } from 'typeorm';
import { Member } from '../member.entity';
import {
  FindAllMemberQueryDto,
  FindAllMemberResDto,
  FindOnePetForAdminResDto,
} from '../dtos/find.admin.dto';
import { paginate, PaginationResult } from 'src/utils/pagination';
import { SubscriptionStatus } from 'src/modules/smollcare/enums/subscription-status.enum';
import { FindOneMemberResDto } from '../dtos/find.admin.dto';
import { Case } from 'src/modules/case/case.entity';
import { PetService } from 'src/modules/pet/services/pet.service';
import { PetSpeciesEnum } from 'src/modules/pet/pet-species.enum';
import { PetGenderEnum } from 'src/modules/pet/enums/pet-gender.enum';

@Injectable()
export class MemberAdminService {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepo: Repository<Member>,
    @InjectRepository(Case)
    private readonly caseRepo: Repository<Case>,
    private readonly petService: PetService,
  ) { }

  async findAll(
    query: FindAllMemberQueryDto,
  ): Promise<PaginationResult<FindAllMemberResDto>> {
    const { search, ...pageQuery } = query;

    const searchQuery = search ? ILike(`%${search}%`) : undefined;

    const findOptions: FindManyOptions<Member> = {
      where: [
        { email: searchQuery },
        { name: searchQuery },
        { phone: searchQuery },
      ],
      relations: {
        pets: true,
        cases: true,
      },
      order: {
        createdAt: 'DESC',
      },
    };

    const result = await paginate(this.memberRepo, pageQuery, findOptions);

    const data: FindAllMemberResDto[] = result.data.map((member) => {
      const visits = member.cases || [];
      const totalSpent = visits.reduce((sum, _case: any) => {
        const checklist = Array.isArray(_case.serviceChecklist) ? _case.serviceChecklist : [];
        const caseTotal = checklist.reduce((acc: number, item: any) => {
          const price = typeof item?.price === 'number' ? item.price : 0;
          return acc + price;
        }, 0);
        return sum + caseTotal;
      }, 0);

      return {
        id: member.id,
        name: member.name,
        phone: member.phone,
        isPhoneVerified: member.isPhoneVerified,
        email: member.email,
        isEmailVerified: member.isEmailVerified,
        profileImg: member.profileImg,
        address: member.address,
        villa: member.villa,
        city: member.city,
        country: member.country,
        postalCode: member.postalCode,
        createdAt: member.createdAt,
        petsCount: member.pets?.length ?? 0,
        visitsCount: visits.length,
        totalSpent,
        pets: (member.pets || []).map((p) => ({
          name: p.name,
          breed: (p as any).breed,
        })),
      };
    });

    return { ...result, data };
  }

  async findAllVetCustomers(
    query: FindAllMemberQueryDto,
  ): Promise<PaginationResult<FindAllMemberResDto>> {
    const { search, ...pageQuery } = query;

    const searchQuery = search ? ILike(`%${search}%`) : undefined;

    const findOptions: FindManyOptions<Member> = {
      where: [
        { isVetCustomer: true, email: searchQuery },
        { isVetCustomer: true, name: searchQuery },
        { isVetCustomer: true, phone: searchQuery },
      ],
      relations: {
        pets: true,
        cases: true,
      },
      order: {
        createdAt: 'DESC',
      },
    };

    const result = await paginate(this.memberRepo, pageQuery, findOptions);

    const data: FindAllMemberResDto[] = result.data.map((member) => {
      const visits = member.cases || [];
      const totalSpent = visits.reduce((sum, _case: any) => {
        const checklist = Array.isArray(_case.serviceChecklist) ? _case.serviceChecklist : [];
        const caseTotal = checklist.reduce((acc: number, item: any) => {
          const price = typeof item?.price === 'number' ? item.price : 0;
          return acc + price;
        }, 0);
        return sum + caseTotal;
      }, 0);

      return {
        id: member.id,
        name: member.name,
        phone: member.phone,
        isPhoneVerified: member.isPhoneVerified,
        email: member.email,
        isEmailVerified: member.isEmailVerified,
        profileImg: member.profileImg,
        address: member.address,
        villa: member.villa,
        city: member.city,
        country: member.country,
        postalCode: member.postalCode,
        createdAt: member.createdAt,
        petsCount: member.pets?.length ?? 0,
        visitsCount: visits.length,
        totalSpent,
        pets: (member.pets || []).map((p) => ({
          name: p.name,
          breed: (p as any).breed,
        })),
      };
    });

    return { ...result, data };
  }

  async findOne(id: string): Promise<FindOneMemberResDto> {
    const member = await this.memberRepo.findOne({
      where: { id },
      relations: {
        pets: {
          subscription: {
            benefitUsages: {
              partner: true,
            },
            plan: {
              benefits: true,
            },
          },
        },
      },
    });

    if (!member) {
      throw new NotFoundException(`Member with id "${id}" not found`);
    }

    const today = new Date();

    const transformedPets = member.pets.map((pet) => {
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
        ...pet,
        subscriptionDetails,
        benefitUsageSummary,
      };
    });

    const visitsCount = await this.caseRepo.count({
      where: { member: { id: member.id } },
    });

    return {
      ...member,
      pets: transformedPets,
      subscription: null,
      petsCount: member.pets?.length ?? 0,
      visitsCount,
    };
  }

  async create(data: Partial<Member>): Promise<Member> {
    const member = this.memberRepo.create(data);
    return this.memberRepo.save(member);
  }

  async createVetCustomer(data: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    villa?: string;
    city?: string;
    country?: string;
    petInfo?: string;
  }): Promise<Member> {
    const { petInfo, ...memberData } = data;

    const member = this.memberRepo.create({
      ...memberData,
      isVetCustomer: true,
    });
    const savedMember = await this.memberRepo.save(member);

    if (petInfo) {
      const parts = petInfo.split(',').map((p) => p.trim()).filter(Boolean);
      const petName = parts[0] || 'Pet';
      const petBreed = parts[1] || '';

      const todayIso = new Date().toISOString();

      await this.petService.create(savedMember.id, {
        name: petName,
        age: 1,
        weight: 0,
        species: PetSpeciesEnum.DOG,
        gender: PetGenderEnum.MALE,
        spayedOrNeutered: false,
        breed: petBreed,
        dob: todayIso as any,
        preExistingConditions: undefined,
        chipNumber: undefined,
        photos: [],
      });
    }

    return savedMember;
  }

  async update(
    id: string,
    data: Partial<Member> & {
      petInfo?: string;
    },
  ): Promise<Member> {
    const { petInfo, ...memberData } = data;

    const member = await this.memberRepo.findOne({ where: { id } });
    if (!member) {
      throw new NotFoundException(`Member with id "${id}" not found`);
    }
    Object.assign(member, memberData);

    const savedMember = await this.memberRepo.save(member);

    // Optionally update/create a simple vet-customer pet from "Pet Name & Breed"
    if (typeof petInfo === 'string') {
      const parts = petInfo
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);

      const petName = parts[0] || '';
      const petBreed = parts[1] || '';

      if (petName) {
        // Load existing pets for this member
        const pets = await this.petService.findAllPetsByMemberId(savedMember.id);
        const primaryPet = pets[0];

        if (primaryPet) {
          await this.petService.update(savedMember.id, primaryPet.id, {
            name: petName,
            breed: petBreed || primaryPet.breed,
          });
        } else {
          const todayIso = new Date().toISOString();

          await this.petService.create(savedMember.id, {
            name: petName,
            age: 1,
            weight: 0,
            species: PetSpeciesEnum.DOG,
            gender: PetGenderEnum.MALE,
            spayedOrNeutered: false,
            breed: petBreed || 'Dog',
            dob: todayIso as any,
            preExistingConditions: undefined,
            chipNumber: undefined,
            photos: [],
          });
        }
      }
    }

    return savedMember;
  }

  async remove(id: string): Promise<void> {
    const member = await this.memberRepo.findOne({ where: { id } });
    if (!member) {
      throw new NotFoundException(`Member with id "${id}" not found`);
    }
    await this.memberRepo.softRemove(member);
  }
}
