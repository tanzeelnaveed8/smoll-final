import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthUser } from 'src/decorators/get-user.decorator';
import {
  FindManyOptions,
  FindOptionsRelations,
  FindOptionsWhere,
  ILike,
  Not,
  Repository,
} from 'typeorm';
import { PartnerService } from '../../partner/services/partner.service';
import { CaseStatusEnum } from '../enums/case-status.enum';
import { Case } from '../case.entity';
import {
  AddNotePayloadDto,
  CloseCasePayloadDto,
  DirectEscalatePayloadDto,
  EscalatePayloadDto,
} from '../dto/create.dto';
import {
  CASE_CLOSED_EVENT,
  CASE_EMERGENCY_ESCALATION_EVENT,
  CASE_ESCALATED_EVENT,
  CaseClosedEvent,
  CaseEmergencyEscalationEvent,
  CaseEscalatedEvent,
} from '../case.event';
import { FindAllCasesForVetQueryDto } from '../dto/find.vet.dto';
import { PaginationResult, paginate } from 'src/utils/pagination';
import { Partner } from 'src/modules/partner/entities/partner.entity';
import { NotificationService } from 'src/modules/notification/notification.service';
import { ConsultationStatusEnum } from 'src/modules/vet/enums/consultation-status.enum';
import { CasePartnerService } from './case.partner.service';
import { Logger } from 'src/configs/logger';
import { SocketEventEnum } from 'src/modules/socket/socket-event.enum';
import { SocketService } from 'src/modules/socket/socket.service';
import { RedisService } from 'src/modules/redis/redis.service';

@Injectable()
export class CaseVetService {
  private readonly logger = Logger.getInstance();

  constructor(
    @InjectRepository(Case)
    private readonly caseRepo: Repository<Case>,
    private readonly partnerService: PartnerService,
    private readonly event: EventEmitter2,
    private readonly notificationService: NotificationService,
    private readonly casePartnerService: CasePartnerService,
    private readonly socketService: SocketService,
    private readonly redisService: RedisService,
  ) {}

  async findAll(
    vet: AuthUser,
    query: FindAllCasesForVetQueryDto,
  ): Promise<PaginationResult<Case>> {
    const { search, ...pageQuery } = query;

    const searchQuery = search ? { name: ILike(`%${search}%`) } : undefined;
    const where: FindOptionsWhere<Case> = {
      assignedVet: { id: vet.id },
    };

    const findOptions: FindManyOptions<Case> = {
      relations: {
        member: true,
        pet: true,
      },
      where: [
        {
          ...where,
          id: ILike(`%${search}%`),
        },
        {
          ...where,
          description: ILike(`%${search}%`),
        },
        {
          ...where,
          vetNote: ILike(`%${search}%`),
        },
        {
          ...where,
          pet: searchQuery,
        },
        {
          ...where,
          member: searchQuery,
        },
        {
          ...where,
          member: {
            phone: ILike(`%${search}%`),
          },
        },
      ],
      select: {
        id: true,
        member: { name: true },
        pet: { name: true },
        createdAt: true,
        updatedAt: true,
        status: true,
        description: true,
      },
      order: {
        updatedAt: 'DESC',
      },
    };

    return paginate(this.caseRepo, pageQuery, findOptions);
  }

  async findOne(
    user: AuthUser,
    id: string,
    relations?: FindOptionsRelations<Case>,
  ) {
    const _case = await this.caseRepo.findOne({
      where: {
        id,
        assignedVet: { id: user.id },
      },
      relations: {
        member: true,
        pet: {
          healthHistory: true,
        },
        vetFeedback: true,
        partnerCosts: {
          partner: true,
        },
        partnerBooking: {
          partner: true,
        },
        ...relations,
      },
      select: {
        id: true,
        notes: true,
        status: true,
        assets: true,
        vetNote: true,
        serviceChecklist: true,
        customerNotReachable: true,
        partnerCosts: {
          id: true,
          note: true,
          services: true,
          partner: {
            id: true,
            name: true,
            clinicImg: {
              url: true,
              filename: true,
              filesize: true,
              mimetype: true,
            },
          },
        },
        partnerBooking: {
          id: true,
          partner: { id: true },
          services: true,
        },
      },
    });

    if (!_case) {
      throw new NotFoundException(`Case with id ${id} not found`);
    }

    return _case;
  }

  async addNote(vet: AuthUser, id: string, body: AddNotePayloadDto) {
    const { notes } = body;

    this.logger.info(
      `[LOG: CASE_VET_SERVICE] Vet ${vet.id} adding note to case ${id}`,
    );

    const _case = await this.findOne(vet, id);

    if (_case.status !== CaseStatusEnum.PENDING) {
      this.logger.error(
        `[LOG: CASE_VET_SERVICE] Vet ${vet.id} tried to add note to case ${id} but case is not pending`,
      );
      throw new BadRequestException('Note can only be added to pending cases.');
    }

    _case.notes = notes;

    const updatedCase = await this.caseRepo.save(_case);

    this.logger.info(
      `[LOG: CASE_VET_SERVICE] Vet ${vet.id} added note to case ${id}`,
    );

    return updatedCase;
  }

  async closeCase(
    vet: AuthUser,
    id: string,
    body: CloseCasePayloadDto,
  ): Promise<Case> {
    const { note } = body;
    const _case = await this.findOne(vet, id, {
      vetConsultation: true,
    });

    if (_case.status === CaseStatusEnum.OPEN_ESCALATED) {
      throw new BadRequestException('Case is escalated at the moment');
    }

    _case.status = CaseStatusEnum.CONFIRMED;
    _case.vetNote = note;
    _case.vetConsultation.status = ConsultationStatusEnum.COMPLETED;

    // Notify user
    this.notificationService.sendOneSignalNotification({
      playerId: _case.member.playerId,
      heading: '✅ Case Confirmed',
      message: `Your case for ${_case.pet.name} has been confirmed.`,
    });

    this.event.emit(
      CASE_CLOSED_EVENT,
      new CaseClosedEvent(vet.name, _case.member.id, _case.pet.name),
    );

    return this.caseRepo.save(_case);
  }

  async escalate(vet: AuthUser, id: string, body: EscalatePayloadDto) {
    const { vetNote, partnerIds } = body;

    const _case = await this.findOne(vet, id, {
      vetConsultation: true,
      member: true,
    });

    // Fetch only the specified partners
    const partners: Partner[] = [];

    for (const partnerId of partnerIds) {
      try {
        const partner = await this.partnerService.findOne(partnerId);
        partners.push(partner);
      } catch (error) {
        // Log the error or handle it as needed
      }
    }

    _case.status = CaseStatusEnum.OPEN_ESCALATED;
    _case.partners = partners;
    _case.vetNote = vetNote ?? '';

    if (_case.vetConsultation) {
      _case.vetConsultation.status = ConsultationStatusEnum.COMPLETED;
    }

    const updatedCase = await this.caseRepo.save(_case);

    // Notify user
    this.notificationService.sendOneSignalNotification({
      playerId: _case.member.playerId,
      heading: '🚨 Case Escalated',
      message: `Your case for ${_case.pet.name} has been escalated to our partners 👨‍⚕️👩‍⚕️`,
    });

    // Notify partners
    this.event.emit(
      CASE_ESCALATED_EVENT,
      new CaseEscalatedEvent(
        _case.member.id,
        partnerIds,
        vet.name,
        _case.pet.name,
      ),
    );

    return updatedCase;
  }

  async updateServiceChecklist(
    vet: AuthUser,
    id: string,
    checklist: { name: string; checked: boolean }[],
  ) {
    const _case = await this.findOne(vet, id);
    _case.serviceChecklist = checklist;
    return this.caseRepo.save(_case);
  }

  async markCustomerNotReachable(vet: AuthUser, id: string) {
    const _case = await this.findOne(vet, id);
    _case.customerNotReachable = true;
    return this.caseRepo.save(_case);
  }

  async addAssets(
    vet: AuthUser,
    id: string,
    assets: { filename: string; filesize: number; mimetype: string; url: string }[],
  ) {
    const _case = await this.findOne(vet, id);

    _case.assets = [...(_case.assets || []), ...assets];

    return this.caseRepo.save(_case);
  }

  async directEscalate(
    vet: AuthUser,
    id: string,
    body: DirectEscalatePayloadDto,
  ) {
    const {
      partnerId,
      services,
      vetNote,
      isEmergency,
      partnerVetId,
      scheduledAt,
    } = body;

    this.logger.info(
      `[LOG: CASE_VET_SERVICE] Directly escalating case ${id} to partner ${partnerId}`,
    );

    const _case = await this.findOne(vet, id, {
      vetConsultation: true,
      member: true,
      pet: true,
    });

    const partner = await this.partnerService.findOne(partnerId);

    _case.status = CaseStatusEnum.OPEN_ESCALATED;
    _case.partners = [partner];
    _case.vetNote = vetNote ?? '';
    _case.isDirectEscalated = true;
    _case.isEmergency = isEmergency ?? false;

    if (_case.vetConsultation) {
      _case.vetConsultation.status = ConsultationStatusEnum.COMPLETED;
    }

    const updatedCase = await this.caseRepo.save(_case);

    this.logger.info(
      `[LOG: CASE_VET_SERVICE] Creating quote for partner ${partner.id} ${
        isEmergency ? 'for emergency' : ''
      }`,
    );

    if (!isEmergency) {
      if (!partnerVetId || !scheduledAt) {
        this.logger.error(
          `[LOG: CASE_VET_SERVICE] Partner vet id and scheduled at are required for non-emergency direct escalation`,
        );

        throw new BadRequestException(
          'Partner vet id and scheduled at are required for non-emergency direct escalation',
        );
      }
    }

    await this.casePartnerService.createQuote(partner, id, {
      services,
      note: '',
      meta: !isEmergency
        ? {
            partnerVetId,
            scheduledAt,
          }
        : undefined,
    });

    try {
      if (isEmergency) {
        this.socketService.emit(SocketEventEnum.CTA_POPUP, {
          type: 'emergency',
          data: {
            caseId: _case.id,
            partnerId: partner.id,
            hasPartnerBooking: false,
            petName: _case.pet.name,
          },
        });

        this.redisService.setJson(
          `popup-emergency:${_case.member.id}`,
          {
            caseId: _case.id,
            partnerId: partner.id,
            hasPartnerBooking: false,
            petName: _case.pet.name,
          },
          60 * 60 * 60 * 42, // 2 days
        );
      }

      this.notificationService.sendOneSignalNotification({
        playerId: _case.member.playerId,
        heading: isEmergency
          ? '🚨 Case Emergency Transferred'
          : '🚨 Case Transferred',
        message: `Your ${isEmergency ? 'emergency' : ''} case for ${_case.pet.name} has been transferred to our partners 👨‍⚕️👩‍⚕️`,
        meta: {
          notificationType: 'quote-submitted',
          caseId: _case.id,
          partnerId: partner.id,
        },
      });

      this.event.emit(
        CASE_EMERGENCY_ESCALATION_EVENT,
        new CaseEmergencyEscalationEvent(
          partner.id,
          partner.name,
          _case.pet.name,
          isEmergency,
        ),
      );
    } catch (error) {
      this.logger.error(
        `[LOG: CASE_VET_SERVICE] Error sending notification to partner ${partner.id}`,
        error,
      );
    }

    return updatedCase;
  }
}
