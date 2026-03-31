import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthUser } from 'src/decorators/get-user.decorator';
import { paginate, PaginationResult } from 'src/utils/pagination';
import { FindManyOptions, In, IsNull, Not, Repository } from 'typeorm';
import { PetService } from '../../pet/services/pet.service';
import { Case } from '../case.entity';
import { CreateCasePayloadDto, CreateCaseQueryDto } from '../dto/create.dto';
import { FindAllCasesForMemberQueryDto } from '../dto/find.member.dto';
import { UpdateCasePayloadDto, UpdateCaseQueryDto } from '../dto/update.dto';
import { CaseStatusEnum } from '../enums/case-status.enum';
import { Logger } from 'src/configs/logger';

@Injectable()
export class CaseMemberService {
  private readonly logger = Logger.getInstance();

  constructor(
    @InjectRepository(Case)
    private readonly caseRepo: Repository<Case>,
    private readonly petService: PetService,
  ) {}

  async findAll(
    member: AuthUser,
    query: FindAllCasesForMemberQueryDto,
  ): Promise<PaginationResult<Case>> {
    const { isEscalated, ...pageQuery } = query;

    const findOptions: FindManyOptions<Case> = {
      relations: {
        pet: true,
        member: true,
        assignedVet: true,
        vetConsultation: true,
        partnerBooking: {
          partner: true,
        },
        partners: true,
        partnerCosts: true,
      },
      where: {
        member: { id: member.id },
        status: isEscalated
          ? In([CaseStatusEnum.OPEN_ESCALATED, CaseStatusEnum.CONFIRMED])
          : undefined,
        partners: isEscalated ? { id: Not(IsNull()) } : undefined,
      },
      select: {
        id: true,
        pet: {
          name: true,
          photos: true,
        },
        assignedVet: {
          name: true,
        },
        vetConsultation: {
          id: true,
          scheduledAt: true,
          status: true,
        },
        status: true,
        createdAt: true,
        partnerBooking: {
          id: true,
          scheduledAt: true,
          partner: {
            id: true,
          },
        },
        partnerCosts: {
          id: true,
          isViewed: true,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    };

    return paginate(this.caseRepo, pageQuery, findOptions);
  }

  findOne(member: AuthUser, id: string): Promise<Case> {
    return this.caseRepo.findOne({
      relations: {
        pet: true,
        vetConsultation: true,
        assignedVet: true,
      },
      where: {
        id,
        member: { id: member.id },
      },
    });
  }

  findQuotes(member: AuthUser, id: string): Promise<Case> {
    return this.caseRepo.findOne({
      where: {
        id,
        member: { id: member.id },
        // partnerBooking: I
      },
      relations: {
        partnerCosts: {
          partner: true,
        },
        pet: true,
      },
      order: {
        partnerCosts: {
          isViewed: 'ASC',
          createdAt: 'DESC',
        },
      },
    });
  }

  async create(
    user: AuthUser,
    query: CreateCaseQueryDto,
    body: CreateCasePayloadDto,
  ) {
    const { petId, vetId } = query;

    await this.petService.findOne(user.id, petId);

    const _case = this.caseRepo.create({
      ...body,
      member: <any>{ id: user.id },
      pet: <any>{ id: petId },
      assignedVet: <any>{ id: vetId },
    });

    return this.caseRepo.save(_case);
  }

  async update(
    user: AuthUser,
    id: string,
    query: UpdateCaseQueryDto,
    body: UpdateCasePayloadDto,
  ) {
    const { petId } = query;

    // if (vetId) {
    //   await this.vetService.findOne(vetId);
    // }

    if (petId) {
      await this.petService.findOne(user.id, petId);
    }

    const _case = await this.findOne(user, id);

    return this.caseRepo.save({
      ..._case,
      ...body,
      ...(petId && { pet: <any>{ id: petId } }),
    });
  }

  async findCaseNewQuotationsCount(member: AuthUser) {
    try {
      const count = await this.caseRepo.count({
        where: { member: { id: member.id }, partnerCosts: { isViewed: false } },
      });

      return count;
    } catch (error) {
      this.logger.error(
        `[LOG: PARTNER_MEMBER_SERVICE] Error finding member new cost counts for user ${member.id}`,
        error,
      );

      return 0;
    }
  }

  async markCaseQuotationAsViewed(
    member: AuthUser,
    id: string,
    quotationId: string,
  ) {
    const _case = await this.caseRepo.findOne({
      where: { id, member: { id: member.id } },
      relations: { partnerCosts: true },
    });

    if (!_case) {
      this.logger.error(
        `[LOG: CASE_MEMBER_SERVICE] Case with id ${id} not found`,
      );

      throw new NotFoundException(`Case with id ${id} not found`);
    }

    this.logger.info(
      `[LOG: CASE_MEMBER_SERVICE] Marking case quotation as viewed for member ${member.id} and case ${id} and quotation ${quotationId}`,
    );

    const quotationCost = _case.partnerCosts?.find(
      (cost) => cost.id == quotationId,
    );

    if (!quotationCost) {
      this.logger.error(
        `[LOG: CASE_MEMBER_SERVICE] Quotation cost with id ${quotationId} not found`,
      );

      throw new NotFoundException(
        `Quotation cost with id ${quotationId} not found`,
      );
    }

    quotationCost.isViewed = true;

    try {
      await this.caseRepo.save(_case);
    } catch (error) {
      this.logger.error(
        `[LOG: CASE_MEMBER_SERVICE] Error marking case quotation as viewed for member ${member.id} and case ${id} and quotation ${quotationId}`,
        error,
      );
    }
  }

  async delete(member: AuthUser, id: string) {
    const caseToDelete = await this.findOne(member, id);
    return this.caseRepo.remove(caseToDelete);
  }
}
