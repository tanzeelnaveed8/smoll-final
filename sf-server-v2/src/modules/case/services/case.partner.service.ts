import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthUser } from 'src/decorators/get-user.decorator';
import {
  FindManyOptions,
  FindOptionsRelations,
  ILike,
  In,
  Repository,
} from 'typeorm';
import { Case } from '../case.entity';
import { PartnerCost } from 'src/modules/partner/entities/partner.cost.entity';
import { NotificationService } from 'src/modules/notification/notification.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PartnerService } from 'src/modules/partner/services/partner.service';
import {
  PARTNER_QUOTE_DELETED,
  PARTNER_QUOTE_UPDATED,
  PARTNER_SUBMIT_QUOTE_EVENT,
  PartnerDeleteQuoteEvent,
  PartnerSubmitQuoteEvent,
  PartnerUpdateQuoteEvent,
} from 'src/modules/partner/partner.event';
import { CreateCaseQuotePayloadDto } from '../dto/create.dto';
import { paginate, PaginationResult } from 'src/utils/pagination';
import { FindAllCasesForPartnerQueryDto } from '../dto/find.partner.dto';
import { PartnerServices } from 'src/modules/partner/entities/partner.services.entity';
import { UpdateCaseQuotePayloadDto } from '../dto/update.dto';
import { CaseStatusEnum } from '../enums/case-status.enum';
import { Logger } from 'src/configs/logger';
import { SocketService } from 'src/modules/socket/socket.service';
import { SocketEventEnum } from 'src/modules/socket/socket-event.enum';
import { RedisService } from 'src/modules/redis/redis.service';
@Injectable()
export class CasePartnerService {
  private readonly logger = Logger.getInstance();

  constructor(
    @InjectRepository(Case)
    private readonly caseRepo: Repository<Case>,
    private readonly notificationService: NotificationService,
    private readonly eventEmitter: EventEmitter2,
    private readonly partnerService: PartnerService,
    private readonly socketService: SocketService,
    private readonly redisService: RedisService,
  ) { }

  async findOne(
    partner: AuthUser,
    id: string,
    relations?: FindOptionsRelations<Case>,
  ): Promise<Case> {
    this.logger.info(
      `[LOG: CASE_PARTNER_SERVICE] findOne called with partnerId: ${partner.id} and caseId: ${id}`,
    );

    const _case = await this.caseRepo.findOne({
      relations,
      where: {
        id,
        partners: { id: partner.id },
      },
    });

    if (!_case) {
      this.logger.error(
        `[LOG: CASE_PARTNER_SERVICE] Case not found with id: ${id}`,
      );
      throw new NotFoundException(`Case with id ${id} not found`);
    }

    return _case;
  }

  async findAll(
    partner: AuthUser,
    query: FindAllCasesForPartnerQueryDto,
  ): Promise<PaginationResult<Case>> {
    this.logger.info(
      `[LOG: CASE_PARTNER_SERVICE] findAll called with partnerId: ${partner.id}`,
    );

    const { search, ...pageQuery } = query;

    const searchQuery = search ? { name: ILike(`%${search}%`) } : undefined;
    const where = {
      partners: { id: partner.id },
      status: In([CaseStatusEnum.OPEN_ESCALATED, CaseStatusEnum.PENDING]),
    };

    const findOptions: FindManyOptions<Case> = {
      relations: {
        member: true,
        pet: true,
        assignedVet: true,
        partnerCosts: { partner: true },
        partnerBooking: {
          partner: true,
        },
      },
      where: [
        {
          pet: searchQuery,
          ...where,
        },
        {
          assignedVet: searchQuery,
          ...where,
        },
        {
          member: {
            name: ILike(`%${search}%`),
          },
          ...where,
        },
        {
          member: {
            phone: ILike(`%${search}%`),
          },
          ...where,
        },
        {
          description: ILike(`%${search}%`),
          ...where,
        },
        {
          vetNote: ILike(`%${search}%`),
          ...where,
        },
      ],
      select: {
        id: true,
        pet: {
          name: true,
        },
        member: {
          name: true,
        },
        assignedVet: {
          name: true,
        },
        partnerCosts: {
          id: true,
          partner: {
            id: true,
          },
        },
        partnerBooking: {
          id: true,
          partner: {
            id: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
      order: {
        updatedAt: 'DESC',
      },
    };

    const res = await paginate(this.caseRepo, pageQuery, findOptions);

    res.data.forEach((caseItem) => {
      // @ts-expect-error quoteExists is not defined in the type
      caseItem.quoteExists = Boolean(
        caseItem.partnerCosts.find((cost) => cost.partner.id === partner.id),
      );
    });

    return res;
  }

  async createQuote(
    partner: AuthUser,
    id: string,
    body: CreateCaseQuotePayloadDto,
    isEmergency?: boolean,
  ): Promise<PartnerCost> {
    this.logger.info(
      `[LOG: CASE_PARTNER_SERVICE] createQuote called with partnerId: ${partner.id}, caseId: ${id} and emergency: ${isEmergency}`,
    );

    const { services, note, meta } = body;

    const _case = await this.findOne(partner, id, {
      member: true,
      pet: true,
    });

    const partnerServices = await this.partnerService.findAllServices(partner);

    const foundServices = partnerServices
      .filter((service) =>
        services.find((s) => s.id.toString() === service.id.toString()),
      )
      .map((service) => ({
        ...service,
        label: services.find((s) => s.id.toString() === service.id.toString())
          ?.label,
      })) as (PartnerServices & { label: string })[];

    const cost = await this.partnerService.createCost(
      partner,
      id,
      foundServices.map((s) => ({
        id: s.id.toString(),
        name: s.title,
        description: s.description,
        price: s.price,
        label: s.label,
        type: s.type,
      })),
      note,
      meta,
    );

    if (!isEmergency) {
      this.notificationService.sendOneSignalNotification({
        playerId: _case.member.playerId,
        heading: '📢 New Quotation!',
        message: `${partner.name} has submitted their quotation, check it out now! 🚀`,
        meta: {
          notificationType: 'quote-submitted',
          caseId: _case.id,
          partnerId: partner.id,
        },
      });

      this.eventEmitter.emit(
        PARTNER_SUBMIT_QUOTE_EVENT,
        new PartnerSubmitQuoteEvent(_case.member.id, partner.name),
      );

      this.socketService.emitToUser(_case.member.id, SocketEventEnum.PARTNER_QUOTATION_SUBMITTED, {
        memberId: _case.member.id
      });

      this.socketService.emitToUser(_case.member.id, SocketEventEnum.CTA_POPUP, {
        type: 'quotation',
        data: {
          caseId: _case.id,
          partnerId: partner.id,
          hasPartnerBooking: false,
          petName: _case.pet.name,
        },
      });

      this.redisService.setJson(
        `popup-quotation:${_case.member.id}`,
        {
          caseId: _case.id,
          partnerId: partner.id,
          hasPartnerBooking: false,
          petName: _case.pet.name,
        },
        60 * 60 * 60 * 42, // 2 days
      );
    }

    return cost;
  }

  async updateQuote(
    partner: AuthUser,
    id: string,
    quoteId: string,
    body: UpdateCaseQuotePayloadDto,
  ): Promise<PartnerCost> {
    this.logger.info(
      `[LOG: CASE_PARTNER_SERVICE] updateQuote called with partnerId: ${partner.id}, caseId: ${id}, and quoteId: ${quoteId}`,
    );

    const { note, services } = body;

    const partnerServices = await this.partnerService.findAllServices(partner);

    let foundServices: (PartnerServices & { label: string })[] | undefined =
      undefined;

    if (services?.length) {
      foundServices = partnerServices
        .filter((service) =>
          services.find((s) => s.id.toString() === service.id.toString()),
        )
        .map((service) => ({
          ...service,
          label: services.find((s) => s.id.toString() === service.id.toString())
            ?.label,
        })) as (PartnerServices & { label: string })[];
    }

    const quote = await this.partnerService.updateCost(
      partner,
      quoteId,
      id,
      foundServices?.map((s) => ({
        id: s.id.toString(),
        name: s.title,
        description: s.description,
        price: s.price,
        label: s.label,
        type: s.type,
      })) ?? undefined,
      note,
    );

    // Check if there's a partnerBooking and update selected services if necessary
    // const _case = await this.findOne(partner, id, { partnerBooking: true });
    // if (
    //   _case.partnerBooking &&
    //   _case.partnerBooking.partner.id === partner.id
    // ) {
    //   const updatedServices = _case.partnerBooking.services.filter((s) =>
    //     foundServices?.some((fs) => fs.id.toString() === s.id.toString()),
    //   );

    //   _case.partnerBooking.services = updatedServices;
    //   await this.caseRepo.save(_case);
    // }

    this.notificationService.sendOneSignalNotification({
      playerId: quote.case.member.playerId,
      heading: '📢 Request Updated!',
      message: `${partner.name} has updated their request, check it out now! 🚀`,
      meta: {
        notificationType: 'quote-updated',
        caseId: id,
        partnerId: partner.id,
      },
    });

    this.eventEmitter.emit(
      PARTNER_QUOTE_UPDATED,
      new PartnerUpdateQuoteEvent(quote.case.member.id, partner.name),
    );

    return quote;
  }

  async deleteQuote(
    partner: AuthUser,
    id: string,
    quoteId: string,
  ): Promise<void> {
    this.logger.info(
      `[LOG: CASE_PARTNER_SERVICE] deleteQuote called with partnerId: ${partner.id}, caseId: ${id}, and quoteId: ${quoteId}`,
    );

    const quote = await this.partnerService.deleteCost(partner, quoteId, id);

    this.notificationService.sendOneSignalNotification({
      playerId: quote.case.member.playerId,
      heading: '📢 Request Removed!',
      message: `${partner.name} has removed their request 😢`,
      meta: {
        notificationType: 'quote-deleted',
        caseId: id,
        partnerId: partner.id,
      },
    });

    this.eventEmitter.emit(
      PARTNER_QUOTE_DELETED,
      new PartnerDeleteQuoteEvent(quote.case.member.id, partner.name),
    );
  }

  async deleteCase(partner: AuthUser, id: string): Promise<void> {
    this.logger.info(
      `[LOG: CASE_PARTNER_SERVICE] deleteCase called with partnerId: ${partner.id} and caseId: ${id}`,
    );

    const _case = await this.caseRepo.findOne({
      where: {
        id,
      },
    });

    if (!_case) {
      this.logger.error(
        `[LOG: CASE_PARTNER_SERVICE] Case not found with id: ${id}`,
      );
      throw new NotFoundException(`Case with id ${id} not found`);
    }

    _case.partners = _case.partners.filter((p) => p.id !== partner.id);

    await this.caseRepo.save(_case);
  }
}
