import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthUser } from 'src/decorators/get-user.decorator';
import {
  Between,
  FindOptionsRelations,
  FindOptionsWhere,
  In,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm';
import { ConsultationStatusEnum } from '../enums/consultation-status.enum';
import { FindVetAvailabilityQueryDto } from '../dtos/find.dto';
import { UpdateConsultationPayloadDto } from '../dtos/update.dto';
import { VetAvailability } from '../entities/vet.availability.entity';
import { VetConsultation } from '../entities/vet.consultation.entity';
import { Vet } from '../entities/vet.entity';
import {
  MEMBER_CANCEL_CONSULTATION_EVENT,
  MemberCancelConsultationEvent,
  VET_ADDED_CASE_EVENT,
  VET_CALL_REQUEST_EVENT,
  VET_CONSULTATION_SCHEDULED_EVENT,
  VetAddedCaseEvent,
  VetCallRequestEvent,
  VetConsultationScheduledEvent,
} from '../vet.event';
import { ScheduleConsultationPayloadDto } from '../dtos/create.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { VetJobNameEnum } from '../vet.processor';
import dayJS from 'src/utils/dayjs';
import { SocketService } from 'src/modules/socket/socket.service';
import { SocketEventEnum } from 'src/modules/socket/socket-event.enum';
import { CaseMemberService } from 'src/modules/case/services/case.member.service';
import { SmollCareSubscription } from 'src/modules/smollcare/entities/smoll-care-subscription.entity';
import { PetService } from 'src/modules/pet/services/pet.service';
import { OrganizationService } from 'src/modules/organization/organization.service';
import { MemberService } from 'src/modules/member/services/member.service';
import { OrgCodeService } from 'src/modules/member/services/member.org-code.service';
import { NotificationService } from 'src/modules/notification/notification.service';
import {
  bookingScheduledTemplateForPartner,
  onlineConsultationReminderTemplate,
} from 'src/utils/emailTemplate';

@Injectable()
export class VetMemberService {
  constructor(
    @InjectRepository(Vet)
    private readonly vetRepo: Repository<Vet>,
    @InjectRepository(VetAvailability)
    private readonly vetAvailabiltyRepo: Repository<VetAvailability>,
    @InjectRepository(VetConsultation)
    private readonly vetConsultationRepo: Repository<VetConsultation>,
    @InjectQueue('vet')
    private readonly vetQueue: Queue,
    private readonly eventEmitter: EventEmitter2,
    private readonly caseService: CaseMemberService,
    private readonly socketService: SocketService,
    private readonly petService: PetService,
    private readonly organizationService: OrganizationService,
    @Inject(forwardRef(() => OrgCodeService))
    private readonly orgCodeService: OrgCodeService,
    @Inject(forwardRef(() => MemberService))
    private readonly memberService: MemberService,
    @InjectRepository(SmollCareSubscription)
    private readonly subscription: Repository<SmollCareSubscription>,
    private readonly notificationService: NotificationService,
  ) {}

  async findAll(): Promise<Vet[]> {
    const vets = await this.vetRepo.find({
      where: { isSuspended: false, isHomeVet: false },
    });

    return vets;
  }

  async findAll2(filter?: {
    specialityId?: string;
    online?: string;
  }): Promise<Vet[]> {
    const where: any = { isSuspended: false, isHomeVet: false };
    if (filter?.online !== undefined) {
      where.isOnline = filter.online === 'true';
    }

    let vets = await this.vetRepo.find({
      where,
      relations: {
        vetSpecialities: {
          speciality: true,
        },
      },
      order: { createdAt: 'DESC' },
    });

    if (filter?.specialityId) {
      const specId = filter.specialityId;
      vets = vets.filter((v) =>
        v.vetSpecialities?.some((vs) => vs.specialityId === specId),
      );
    }

    return vets;
  }

  async findOne(id: string, entitiesToLoad?: string[]): Promise<Vet> {
    let relations = [];

    if (entitiesToLoad) {
      relations = entitiesToLoad;
    }

    const vet = await this.vetRepo.findOne({
      where: { id },
      // relations
      relations: {
        ...(relations as any),
        vetSpecialities: {
          speciality: true,
        },
      },
    });

    if (!vet) {
      throw new NotFoundException(`Vet with "${id}" not found`);
    }

    return vet;
  }

  async findOneByEmail(email: string): Promise<Vet> {
    const vet = await this.vetRepo.findOne({
      where: { email },
    });

    return vet;
  }

  async findOneConsultation(
    member: AuthUser,
    id: string,
    entitiesToLoad?: FindOptionsRelations<VetConsultation>,
  ): Promise<VetConsultation> {
    const consultation = await this.vetConsultationRepo.findOne({
      where: {
        id,
        member: { id: member.id },
      },
      relations: entitiesToLoad,
    });

    if (!consultation) {
      throw new NotFoundException(`Consultation with id "${id}" not found`);
    }

    return consultation;
  }

  async requestConsultation(
    member: AuthUser,
    id: string,
    petId: string,
  ): Promise<VetConsultation> {
    const vet = await this.findOne(id);
    const pets = await this.petService.findAllPetsByMemberId(member.id);
    let isSmollVetAccessValid = false;

    //Extracting pet Ids
    const petIds = pets.map((pet) => pet.id);

    //checking active subscription if any
    const today = new Date();
    const subscription = await this.subscription.find({
      where: {
        pet: {
          id: In(petIds),
        },
        endDate: MoreThanOrEqual(today),
      },
    });

    if (subscription.length === 0) {
      const usedCode = await this.orgCodeService.findUsedCodeByMember(
        member.id,
      );

      const linkedOrganization =
        await this.memberService.findOrganizationByMemberId(member.id);
      if (
        linkedOrganization &&
        linkedOrganization.isSmollVetAccessValid &&
        linkedOrganization.isSmollVetAccessValid() &&
        linkedOrganization.domainAccessEnabled &&
        !usedCode
      ) {
        isSmollVetAccessValid = true;
      }

      if (usedCode && usedCode.usedAt) {
        let isCodeActive = true;
        if (
          usedCode.maxUsageMonths !== null &&
          usedCode.maxUsageMonths !== undefined
        ) {
          const expiry = new Date(usedCode.usedAt);
          expiry.setMonth(expiry.getMonth() + usedCode.maxUsageMonths);
          isCodeActive = new Date() <= expiry;
        } else {
          const validUntil = linkedOrganization?.smollVetAccessEndDate
            ? new Date(linkedOrganization.smollVetAccessEndDate)
            : null;
          const now = new Date();
          isCodeActive = validUntil ? now <= validUntil : false;
        }

        if (isCodeActive && usedCode.organization) {
          isSmollVetAccessValid = true;
        }
      }

      if (!isSmollVetAccessValid) {
        if (member.email && member.loginWithEmail) {
          const domain = member.email.split('@')[1];
          if (!domain) {
            throw new UnauthorizedException('Invalid email domain');
          }

          const organization =
            await this.organizationService.findByDomain(domain);
          isSmollVetAccessValid =
            !!organization &&
            organization.isSmollVetAccessValid() &&
            organization.domainAccessEnabled;
        } else {
          isSmollVetAccessValid =
            !!linkedOrganization && linkedOrganization.isSmollVetAccessValid();
        }
      }
    }

    if (!isSmollVetAccessValid && subscription.length === 0) {
      const consultation = await this.vetConsultationRepo.findOne({
        where: {
          member: { id: member.id },
          status: In([
            ConsultationStatusEnum.COMPLETED,
            ConsultationStatusEnum.SCHEDULED,
            ConsultationStatusEnum.INITIATED,
          ]),
        },
      });
      if (consultation) {
        throw new BadRequestException(
          "You've used your free consulatation call.",
        );
      }
    }

    if (!vet.isOnline) {
      throw new BadRequestException('Vet is not online at the moment!');
    }

    let consultation = await this.vetConsultationRepo.findOne({
      where: {
        vet: { id },
        member: { id: member.id },
        status: Not(
          In([
            ConsultationStatusEnum.COMPLETED,
            ConsultationStatusEnum.SCHEDULED,
          ]),
        ),
      },
    });

    if (consultation) {
      await this.vetConsultationRepo.delete(consultation.id);
    }

    consultation = this.vetConsultationRepo.create({
      vet: { id },
      status: ConsultationStatusEnum.INITIATED,
      member: { id: member.id },
    });

    await this.vetConsultationRepo.save(consultation);

    this.eventEmitter.emit(
      VET_CALL_REQUEST_EVENT,
      new VetCallRequestEvent(id, member.name),
    );

    return consultation;
  }

  async scheduleConsultation(
    member: AuthUser,
    id: string,
    body: ScheduleConsultationPayloadDto,
  ): Promise<VetConsultation> {
    const { scheduleAt, caseId, petId } = body;

    const today = new Date();
    const subscription = await this.subscription.findOne({
      where: {
        pet: {
          id: petId,
        },
        endDate: MoreThanOrEqual(today),
      },
    });

    if (!subscription) {
      const consultation = await this.vetConsultationRepo.findOne({
        where: {
          member: { id: member.id },
          status: In([
            ConsultationStatusEnum.COMPLETED,
            ConsultationStatusEnum.SCHEDULED,
            ConsultationStatusEnum.INITIATED,
          ]),
        },
      });
      if (consultation) {
        throw new BadRequestException("You've used your free consulatation.");
      }
    }

    let consultation = await this.vetConsultationRepo.findOne({
      where: {
        vet: { id },
        scheduledAt: scheduleAt,
        status: In([
          ConsultationStatusEnum.INITIATED,
          ConsultationStatusEnum.SCHEDULED,
        ]),
      },
    });

    if (consultation) {
      throw new BadRequestException(
        'Consultation already scheduled at this time',
      );
    }

    consultation = this.vetConsultationRepo.create({
      vet: { id },
      scheduledAt: scheduleAt,
      status: ConsultationStatusEnum.SCHEDULED,
      member: { id: member.id },
      case: { id: caseId },
    });

    consultation = await this.vetConsultationRepo.save(consultation);

    // Schedule a job to send a notification 1 minutes before the consultation
    const now = dayJS().utc();
    const consultationTime = dayJS.utc(consultation.scheduledAt);
    const notificationTime = consultationTime;

    const delay = Math.max(notificationTime.diff(now), 0);

    this.eventEmitter.emit(
      VET_CONSULTATION_SCHEDULED_EVENT,
      new VetConsultationScheduledEvent(id, member.name),
    );

    this.socketService.emit(SocketEventEnum.VET_CONSULTATION_SCHEDULED, {
      by: member.name,
      vetId: id,
    });

    await this.vetQueue.add(
      VetJobNameEnum.CONSULTATION_NOTIFICATION,
      {
        consultationId: consultation.id,
        notificationType: VetJobNameEnum.CONSULTATION_NOTIFICATION,
      },
      { delay, removeOnComplete: true, removeOnFail: true },
    );

    // Schedule a job to expire the consultation after an hour if not closed
    const expirationTime = consultationTime.add(30, 'minutes');
    const expirationDelay = Math.max(expirationTime.diff(now), 0);

    await this.vetQueue.add(
      VetJobNameEnum.CONSULTATION_EXPIRED,
      {
        consultationId: consultation.id,
      },
      { delay: expirationDelay, removeOnComplete: true, removeOnFail: true },
    );

    this._notifyForConsultation(consultation.id);

    return consultation;
  }

  async cancelConsultation(member: AuthUser, id: string) {
    const consultation = await this.findOneConsultation(member, id, {
      vet: true,
    });

    await this.vetConsultationRepo.softRemove(consultation);

    this.eventEmitter.emit(
      MEMBER_CANCEL_CONSULTATION_EVENT,
      new MemberCancelConsultationEvent(consultation.vet.id, member.name),
    );
  }

  async updateConsultationCase(
    member: AuthUser,
    consultationId: string,
    body: UpdateConsultationPayloadDto,
  ): Promise<void> {
    const { caseId } = body;

    const consultation = await this.vetConsultationRepo.findOne({
      where: { id: consultationId, member: { id: member.id } },
      relations: ['vet', 'case'],
    });

    if (!consultation) {
      throw new NotFoundException('Consultation not found');
    }

    const _case = await this.caseService.findOne(member, caseId);
    consultation.case = _case;

    await this.vetConsultationRepo.save(consultation);

    this.eventEmitter.emit(
      VET_ADDED_CASE_EVENT,
      new VetAddedCaseEvent(consultation.vet.id, member.name),
    );
  }

  async findAvailabilities(
    vetId: string,
    query: FindVetAvailabilityQueryDto,
  ): Promise<VetAvailability[]> {
    const { date } = query;

    await this.findOne(vetId);

    try {
      const startDate = date ? new Date(date) : new Date();
      if (isNaN(startDate.getTime())) {
        throw new BadRequestException('Invalid date provided');
      }

      const endDate = new Date(startDate);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      const consultations = await this.vetConsultationRepo.find({
        where: {
          vet: { id: vetId },
          scheduledAt: Between(startDate, endDate),
          status: In([
            ConsultationStatusEnum.INITIATED,
            ConsultationStatusEnum.SCHEDULED,
          ]),
        },
      });

      const where: FindOptionsWhere<VetAvailability>[] = [];

      if (date) {
        const dayOfWeek = startDate
          .toLocaleString('en-US', { weekday: 'short' })
          .toLowerCase();

        where.push(
          { vet: { id: vetId }, date: startDate },
          { vet: { id: vetId }, dayOfWeek },
        );
      } else {
        where.push({ vet: { id: vetId } });
      }

      let availabilities = await this.vetAvailabiltyRepo.find({
        where,
      });

      // @ts-expect-error - will fix type later
      availabilities = availabilities.map((availability) => {
        const newIntervals = [];

        for (const interval of availability.intervals) {
          const intervalStart = new Date(`1970-01-01T${interval.from}Z`);
          const intervalEnd = new Date(`1970-01-01T${interval.to}Z`);

          while (intervalStart < intervalEnd) {
            const slotEnd = new Date(intervalStart.getTime() + 15 * 60000);
            if (slotEnd > intervalEnd) {
              break;
            }

            const slotStart = this.formatTime(intervalStart);
            const slotEndTime = this.formatTime(slotEnd);

            const isSlotAvailable = !consultations.some((consultation) => {
              const consultationStart = new Date(consultation.scheduledAt);
              const consultationEnd = new Date(
                consultationStart.getTime() + 15 * 60000,
              );

              // Create slot times using the same date as the consultation
              const slotStartTime = new Date(consultationStart);
              slotStartTime.setHours(
                intervalStart.getHours(),
                intervalStart.getMinutes(),
                0,
                0,
              );
              const slotEndTime = new Date(consultationStart);
              slotEndTime.setHours(
                slotEnd.getHours(),
                slotEnd.getMinutes(),
                0,
                0,
              );

              return (
                consultationStart < slotEndTime &&
                consultationEnd > slotStartTime
              );
            });

            if (isSlotAvailable) {
              newIntervals.push({ from: slotStart, to: slotEndTime });
            }

            intervalStart.setTime(slotEnd.getTime());
          }
        }

        return { ...availability, intervals: newIntervals };
      });

      return availabilities;
    } catch (error) {
      console.error('Error fetching availabilities:', error);
      throw new BadRequestException('Error fetching availabilities');
    }
  }

  private formatTime(date: Date): string {
    return date.toISOString().slice(11, 16);
  }

  private parseOffset(timezone: string): number {
    const match = timezone?.match(/GMT\s*([+-]\d{2}):(\d{2})/);
    if (match) {
      const [, hours, minutes] = match;
      return parseInt(hours, 10) * 60 + parseInt(minutes, 10);
    }
    return 0;
  }

  private async _notifyForConsultation(consultationId: string) {
    try {
      const consultation = await this.vetConsultationRepo.findOne({
        where: { id: consultationId },
        relations: {
          member: true,
          vet: true,
          case: true,
        },
        select: {
          id: true,
          scheduledAt: true,
          case: {
            id: true,
            isEmergency: true,
          },
          vet: {
            name: true,
            email: true,
            phone: true,
            timeZone: true,
          },
          member: {
            name: true,
            email: true,
            timeZone: true,
          },
        },
      });

      if (!consultation) return;

      if (consultation.member?.email) {
        const memberTimeZone = consultation.member.timeZone || 'GMT +04:00';
        const memberOffset = this.parseOffset(memberTimeZone);

        const memberLocalDate = dayJS(consultation.scheduledAt)
          .utcOffset(memberOffset)
          .format('DD MMMM YYYY');

        const memberLocalTime = dayJS(consultation.scheduledAt)
          .utcOffset(memberOffset)
          .format('hh:mm A');

        await this.notificationService.sendEmailNotification(
          consultation.member.email,
          'Consultation Scheduled',
          onlineConsultationReminderTemplate(
            consultation.member.name,
            consultation.vet?.name,
            memberLocalDate,
            memberLocalTime,
            consultation.vet?.phone,
            consultation.vet?.email,
          ),
        );
      }

      if (consultation.vet?.email) {
        const vetTimeZone = consultation.vet.timeZone || 'GMT +04:00';
        const vetOffset = this.parseOffset(vetTimeZone);

        const vetLocalTime = dayJS(consultation.scheduledAt)
          .utcOffset(vetOffset)
          .format('DD MMMM YYYY, hh:mm A');

        await this.notificationService.sendEmailNotification(
          consultation.vet.email,
          'New Consultation',
          bookingScheduledTemplateForPartner(
            consultation.vet.name,
            consultation.member?.name,
            undefined,
            vetLocalTime,
            false,
            consultation.case?.isEmergency ?? false,
          ),
        );
      }
    } catch (_) {}
  }
}
