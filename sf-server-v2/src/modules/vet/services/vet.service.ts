import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthUser } from 'src/decorators/get-user.decorator';
import { PwdService } from '../../../modules/auth/services/pwd.service';
import { CaseStatusEnum } from 'src/modules/case/enums/case-status.enum';
import UpdateCometUserPayloadDto from 'src/modules/chat/dtos/update.dto';
import { SocketEventEnum } from 'src/modules/socket/socket-event.enum';
import { SocketService } from 'src/modules/socket/socket.service';
import dayJS from 'src/utils/dayjs';
import { paginate, PaginationResult } from 'src/utils/pagination';
import {
  Between,
  FindManyOptions,
  FindOptionsWhere,
  In,
  IsNull,
  Not,
  Repository,
  ILike,
} from 'typeorm';
import { AdminCreateConsultationPayloadDto, CreateAvailabilityDto } from '../dtos/create.dto';
import {
  FindConsultationCalendarQueryDto,
  FindConsultationsForVetQueryDto,
  FindMemberForVetResDto,
  FindVetAvailabilityQueryDto,
} from '../dtos/find.dto';
import { UpdateVetPayloadDto } from '../dtos/update.dto';
import { VetAvailability } from '../entities/vet.availability.entity';
import { VetConsultation } from '../entities/vet.consultation.entity';
import { Vet } from '../entities/vet.entity';
import { ConsultationStatusEnum } from '../enums/consultation-status.enum';
import { ConsultationTypeEnum } from '../enums/consultation-type.enum';
import { VET_CALL_INITIATE_EVENT, VetCallInitiateEvent } from '../vet.event';
import { onlineConsultationReminderTemplate } from 'src/utils/emailTemplate';
import { NotificationService } from 'src/modules/notification/notification.service';
import { Member } from 'src/modules/member/member.entity';
import { Pet } from 'src/modules/pet/entities/pet.entity';
import { CreatePetPayloadDto } from 'src/modules/pet/dto/create.dto';
import { CreateCasePayloadDto, CreateCaseQueryDto } from 'src/modules/case/dto/create.dto';
import { Case } from 'src/modules/case/case.entity';
import { PetService } from 'src/modules/pet/services/pet.service';
import { SubscriptionStatus } from 'src/modules/smollcare/enums/subscription-status.enum';

@Injectable()
export class VetService {
  constructor(
    @InjectRepository(Vet)
    private readonly vetRepo: Repository<Vet>,
    @InjectRepository(VetAvailability)
    private readonly vetAvailabiltyRepo: Repository<VetAvailability>,
    @InjectRepository(VetConsultation)
    private readonly vetConsultationRepo: Repository<VetConsultation>,
    private readonly socketService: SocketService,
    private readonly eventEmitter: EventEmitter2,
    private readonly pwdService: PwdService,
    private readonly notificationService: NotificationService,
    @InjectRepository(Member)
    private readonly memberRepo: Repository<Member>,
    @InjectRepository(Pet)
    private readonly petRepo: Repository<Pet>,
    @InjectRepository(Case)
    private readonly caseRepo: Repository<Case>,
    private readonly petService: PetService,

  ) { }

  async findOne(id: string): Promise<Vet> {
    const vet = await this.vetRepo.findOne({
      where: { id },
      relations: {
        availabilities: true,
      },
    });

    if (!vet) {
      throw new NotFoundException(`Vet with "${id}" not found`);
    }

    return vet;
  }

  async findOneByEmail(email: string): Promise<Vet> {
    const vet = await this.vetRepo.findOne({
      where: { email, isSuspended: false },
    });

    return vet;
  }

  async findAll(): Promise<Vet[]> {
    return this.vetRepo.find({
      where: { isSuspended: false },
    });
  }

  async findHomeVets(
    isSuspended: boolean,
    search?: string,
    page = 1,
    limit = 10,
  ): Promise<PaginationResult<Vet>> {
    const where: FindOptionsWhere<Vet> = {
      isHomeVet: true,
      isSuspended,
    };

    if (search) {
      (where as any).name = ILike(`%${search}%`);
    }

    const options: FindManyOptions<Vet> = {
      where,
      order: { createdAt: 'DESC' },
    };

    return paginate(this.vetRepo, { page, limit }, options);
  }

  async update(id: string, body: UpdateVetPayloadDto): Promise<Vet> {
    const vet = await this.findOne(id);
    const _body = { ...body };

    const cometUpdates: UpdateCometUserPayloadDto = {};

    if (body.name) {
      cometUpdates.name = body.name;
    }

    if (body.profileImg) {
      cometUpdates.avatar = body.profileImg.url;
    }

    // TOOD: move this logic in pwd service ( for partner as well )
    if (body.password) {
      const comparePassword = await this.pwdService.comparePwd(
        body.oldPassword,
        vet.password,
      );

      if (!comparePassword || !body.oldPassword) {
        throw new BadRequestException('Invalid password');
      }

      const hashedPassword = await this.pwdService.hashPwd(body.password);
      _body.password = hashedPassword;
    }

    if (typeof body.isOnline === 'boolean') {
      // Trigger a socket event to update the vet's online status
      this.socketService.emit(SocketEventEnum.VET_ONLINE_STATUS_CHANGE, {
        vetId: vet.id,
        isOnline: body.isOnline,
      });
    }

    return this.vetRepo.save({ ...vet, ..._body });
  }

  async findAvailabilities(
    vetId: string,
    query: FindVetAvailabilityQueryDto,
  ): Promise<VetAvailability[]> {
    const { date } = query;

    await this.findOne(vetId);

    const where: FindOptionsWhere<VetAvailability>[] = [];

    if (date) {
      const dayOfWeek = new Date(date)
        .toLocaleString('en-US', { weekday: 'short' })
        .toLowerCase();

      where.push(
        { vet: { id: vetId }, date },
        { vet: { id: vetId }, dayOfWeek },
      );
    } else {
      where.push({ vet: { id: vetId } });
    }

    return this.vetAvailabiltyRepo.find({
      where,
    });
  }

  async findOneMember(id: string): Promise<FindMemberForVetResDto> {
    const today = new Date();

    const member = await this.memberRepo.findOne({
      where: { id },
      relations: {
        pets: {
          subscription: {
            plan: {
              benefits: true,
            },
            benefitUsages: {
              partner: true,
            },
          },
        },
      },
    });

    if (!member) throw new BadRequestException('Member with associated id not found');

    const petsWithUsage = member.pets.map((pet) => {
      let benefitUsageSummary = [];
      let subscriptionDetails = null;

      if (
        pet.subscription &&
        pet.subscription.endDate >= today &&
        pet.subscription.status !== SubscriptionStatus.REVOKED
      ) {

        subscriptionDetails = pet.subscription
          ? {
            status: pet.subscription.status,
            startDate: pet.subscription.startDate,
            endDate: pet.subscription.endDate,
          }
          : null;

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
      } else {
        pet.careId = null
      }

      return {
        ...pet,
        subscriptionDetails,
        benefitUsageSummary,
      };
    });

    return {
      ...member,
      pets: petsWithUsage,
    };
  }


  async createCase(
    memberId: string,
    query: CreateCaseQueryDto,
    body: CreateCasePayloadDto,
  ) {
    const { petId, vetId } = query;

    await this.petService.findOne(memberId, petId);
    await this.findOne(vetId);

    const _case = this.caseRepo.create({
      ...body,
      member: <any>{ id: memberId },
      pet: <any>{ id: petId },
      assignedVet: <any>{ id: vetId },
    });

    return this.caseRepo.save(_case);
  }

  async createPet(
    memberId: string,
    body: CreatePetPayloadDto
  ): Promise<Pet> {

    const member = await this.memberRepo.findOne({
      where: {
        id: memberId,
      }
    })

    if (!member) throw new BadRequestException('Member with associated id not found')

    const pet = this.petRepo.create({
      ...body,
      owner: { id: memberId }
    })

    return await this.petRepo.save(pet)
  }

  // NOTE: Only instant consultation is needed by client
  // TODO: We can refactor this service function later
  async findConsultations(
    user: AuthUser,
    query: FindConsultationsForVetQueryDto,
  ): Promise<PaginationResult<VetConsultation>> {
    const { type, isCompleted, ...pageQuery } = query;

    const where: FindOptionsWhere<VetConsultation> = {
      vet: { id: user.id },
      ...(isCompleted
        ? {}
        : {
            case: [
              { status: CaseStatusEnum.PENDING },
              { id: IsNull() },
            ],
          }),
    };

    switch (type) {
      case ConsultationTypeEnum.SCHEDULED:
        where.scheduledAt = Not(IsNull());
        where.status = ConsultationStatusEnum.SCHEDULED;
        break;
      case ConsultationTypeEnum.INSTANT:
        where.scheduledAt = IsNull();
        break;
    }

    if (isCompleted) {
      where.status = In([
        ConsultationStatusEnum.COMPLETED,
        ConsultationStatusEnum.INITIATED,
        ConsultationStatusEnum.REJECTED,
      ]);
    }

    const findOptions: FindManyOptions<VetConsultation> = {
      where,
      relations: {
        member: true,
        case: {
          pet: true,
        },
        vet: true,
      },
      select: {
        id: true,
        member: {
          id: true,
          name: true,
          phone: true,
          address: true,
        },
        scheduledAt: true,
        case: {
          description: true,
          pet: {
            name: true,
          },
        },
        createdAt: true,
        status: true,
        rejectedByVetName: true,
        acceptedAt: true,
        vet: {
          id: true,
          name: true,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    };

    return paginate(this.vetConsultationRepo, pageQuery, findOptions);
  }

  /**
   * Admin view of vet consultations – does not filter by specific vet id.
   */
  async findConsultationsForAdmin(
    query: FindConsultationsForVetQueryDto,
  ): Promise<PaginationResult<VetConsultation>> {
    const { type, isCompleted, ...pageQuery } = query;

    // For admin view we want to see all consultations regardless of whether
    // a case has been created yet. Avoid filtering by case here, otherwise
    // newly created admin consultations without a linked case may be hidden.
    const where: FindOptionsWhere<VetConsultation> = {};

    switch (type) {
      case ConsultationTypeEnum.SCHEDULED:
        where.scheduledAt = Not(IsNull());
        where.status = ConsultationStatusEnum.SCHEDULED;
        break;
      case ConsultationTypeEnum.INSTANT:
        where.scheduledAt = IsNull();
        break;
    }

    if (isCompleted) {
      where.status = In([
        ConsultationStatusEnum.COMPLETED,
        ConsultationStatusEnum.INITIATED,
        ConsultationStatusEnum.REJECTED,
      ]);
    }

    const findOptions: FindManyOptions<VetConsultation> = {
      where,
      relations: {
        member: true,
        case: {
          pet: true,
        },
        vet: true,
      },
      select: {
        id: true,
        member: {
          id: true,
          name: true,
          phone: true,
          address: true,
        },
        scheduledAt: true,
        case: {
          id: true,
          description: true,
          serviceChecklist: true,
          pet: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
        status: true,
        rejectedByVetName: true,
        acceptedAt: true,
        vet: {
          id: true,
          name: true,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    };

    return paginate(this.vetConsultationRepo, pageQuery, findOptions);
  }

  async findConsultationCalendar(
    vet: AuthUser,
    query: FindConsultationCalendarQueryDto,
  ): Promise<{
    consultations: VetConsultation[];
    lastDate: string | null;
  }> {
    const { startDate, type } = query;

    const start = dayJS(startDate);
    const end = type === 'monthly' ? start.add(30, 'day') : start.add(7, 'day');

    const consultations = await this.vetConsultationRepo.find({
      where: {
        vet: { id: vet.id },
        scheduledAt: Between(start.toDate(), end.toDate()),
      },
      relations: {
        member: true,
        case: true,
      },
      select: {
        id: true,
        scheduledAt: true,
        status: true,
        member: {
          id: true,
          name: true,
        },
        case: {
          id: true,
        },
      },
      order: {
        scheduledAt: 'ASC',
      },
    });

    const lastDate = end.toISOString();

    return {
      consultations,
      lastDate,
    };
  }

  async findOneConsultations(
    user: AuthUser,
    id: string,
  ): Promise<VetConsultation> {
    return this.vetConsultationRepo.findOne({
      where: {
        id,
        vet: {
          id: user.id,
        },
      },
      relations: {
        member: true,
        case: {
          pet: {
            healthHistory: true,
          },
        },
      },
    });
  }

  /**
   * Admin helpers (no vet ownership check)
   */
  async adminFindOneConsultation(id: string): Promise<VetConsultation> {
    const consultation = await this.vetConsultationRepo.findOne({
      where: { id },
      relations: {
        member: true,
        case: {
          pet: true,
        },
        vet: true,
      },
    });
    if (!consultation) {
      throw new NotFoundException(`Consultation with id "${id}" not found`);
    }
    return consultation;
  }

  async adminAssignVetToConsultation(
    consultationId: string,
    vetId: string,
  ): Promise<VetConsultation> {
    const consultation = await this.adminFindOneConsultation(consultationId);
    const vet = await this.vetRepo.findOne({ where: { id: vetId } });
    if (!vet) {
      throw new NotFoundException(`Vet with id "${vetId}" not found`);
    }

    consultation.vet = vet;
    if (consultation.case) {
      consultation.case.assignedVet = vet as any;
      await this.caseRepo.save(consultation.case);
    }
    return this.vetConsultationRepo.save(consultation);
  }

  async adminUpdateConsultationNote(
    consultationId: string,
    note: string,
  ): Promise<void> {
    const consultation = await this.adminFindOneConsultation(consultationId);
    if (!consultation.case) return;

    const caseEntity = await this.caseRepo.findOne({
      where: { id: consultation.case.id },
    });
    if (!caseEntity) return;

    const notes = caseEntity.notes ?? [];
    notes.push({
      note,
      author: 'Admin',
      createdAt: new Date().toISOString(),
    } as any);
    caseEntity.notes = notes;
    await this.caseRepo.save(caseEntity);
  }

  async adminCancelConsultation(consultationId: string): Promise<void> {
    const consultation = await this.adminFindOneConsultation(consultationId);
    consultation.status = ConsultationStatusEnum.REJECTED;
    await this.vetConsultationRepo.save(consultation);
  }

  async adminConfirmConsultation(consultationId: string): Promise<void> {
    const consultation = await this.adminFindOneConsultation(consultationId);
    // Admin "confirm" in Vet Admin should mark the consultation as
    // pending action from the vet, not clinically completed.
    // Use INITIATED as a "pending for vet" state; Homesuite treats
    // both INITIATED and SCHEDULED as upcoming visits.
    consultation.status = ConsultationStatusEnum.INITIATED;
    await this.vetConsultationRepo.save(consultation);
  }

  async initiateCall(vet: AuthUser, consultationId: string): Promise<void> {
    const consultation = await this.findOneConsultations(vet, consultationId);

    this.socketService.emit(SocketEventEnum.VET_CALL_INITIATE, {
      vetId: vet.id,
      consultationId: consultationId,
      caseId: consultation.case.id,
    });

    this.eventEmitter.emit(
      VET_CALL_INITIATE_EVENT,
      new VetCallInitiateEvent(consultation.member.id, vet.name),
    );
  }

  async initiateWithCallId(
    vet: AuthUser,
    memberId: string,
    callId: string,
  ): Promise<void> {
    this.socketService.emit(SocketEventEnum.VET_CALL_INITIATE_WITH_CALL_ID, {
      vetId: vet.id,
      memberId,
      callId,
    });
  }

  async closeConsultation(vet: AuthUser, id: string): Promise<VetConsultation> {
    const consultation = await this.findOneConsultations(vet, id);

    consultation.status = ConsultationStatusEnum.COMPLETED;
    await this.vetConsultationRepo.save(consultation);

    return consultation;
  }

  async acceptConsultation(vet: AuthUser, id: string): Promise<VetConsultation> {
    const consultation = await this.findOneConsultations(vet, id);
    if (
      consultation.status !== ConsultationStatusEnum.SCHEDULED &&
      consultation.status !== ConsultationStatusEnum.INITIATED
    ) {
      throw new BadRequestException('Only pending/scheduled consultations can be accepted');
    }
    consultation.acceptedAt = new Date();
    await this.vetConsultationRepo.save(consultation);
    return consultation;
  }

  async rejectConsultation(vet: AuthUser, id: string): Promise<VetConsultation> {
    const consultation = await this.findOneConsultations(vet, id);
    if (
      consultation.status !== ConsultationStatusEnum.SCHEDULED &&
      consultation.status !== ConsultationStatusEnum.INITIATED
    ) {
      throw new BadRequestException('Only pending/scheduled consultations can be rejected');
    }
    consultation.status = ConsultationStatusEnum.REJECTED;
    consultation.rejectedByVetName = vet.name;
    await this.vetConsultationRepo.save(consultation);
    return consultation;
  }

  async createAvailability(
    vetId: string,
    body: CreateAvailabilityDto,
  ): Promise<VetAvailability[]> {
    const { availability } = body;
    const vet = await this.findOne(vetId);

    if (!vet) {
      throw new NotFoundException(`Vet with id "${vetId}" not found`);
    }

    const availabilities: VetAvailability[] = [];

    for (const day of Object.keys(availability)) {
      const isDate = day.length > 5;
      const where = isDate
        ? { vet: { id: vetId }, date: new Date(day) }
        : { vet: { id: vetId }, dayOfWeek: day };

      // Validate intervals
      const validIntervals = availability[day].filter((interval) => {
        const start = new Date(`1970-01-01T${interval.from}Z`);
        const end = new Date(`1970-01-01T${interval.to}Z`);

        return start < end;
      });

      if (validIntervals.length !== availability[day].length) {
        throw new BadRequestException(`Invalid intervals provided for ${day}`);
      }

      const existingAvailability = await this.vetAvailabiltyRepo.findOne({
        where,
      });

      if (existingAvailability) {
        // Update existing availability
        existingAvailability.intervals = validIntervals;
        availabilities.push(existingAvailability);
      } else {
        // Create new availability
        availabilities.push(
          this.vetAvailabiltyRepo.create({
            vet: { id: vetId },
            dayOfWeek: isDate ? null : day,
            date: isDate ? new Date(day) : null,
            intervals: validIntervals,
          }),
        );
      }
    }

    return await this.vetAvailabiltyRepo.save(availabilities);
  }

  async sendReminder(vet: AuthUser, consultationId: string): Promise<void> {
    const consultation = await this.findOneConsultations(vet, consultationId);
    const member = consultation.member;

    try {
      this.notificationService.sendOneSignalNotification({
        heading: 'Reminder',
        message: `🔔 Reminder: You have an upcoming appointment with ${vet.name}.`,
        playerId: member.playerId,
        meta: {
          notificationType: 'vet-consultation-reminder',
          consultationId,
          petName: consultation.case.pet.name,
        },
      });
    } catch (error) {
      console.log('error', error);
    }

    try {
      this.notificationService.sendSmsNotification(
        member.phone,
        `🔔 Reminder: You have an upcoming appointment with ${vet.name}.`,
      );
    } catch (error) {
      console.log('error', error);
    }

    if (member.email) {
      try {
        this.notificationService.sendEmailNotification(
          member.email,
          'Smoll: You have an upcoming appointment',
          onlineConsultationReminderTemplate(
            member.name,
            vet.name,
            dayJS(consultation.scheduledAt).utc().format('MMM D, YYYY'),
            dayJS(consultation.scheduledAt).utc().format('h:mm A [UTC]'),
            vet.phone,
            member.email,
          ),
        );
      } catch (error) {
        console.log('error email', error);
      }
    }
  }

  async adminCreateConsultation(
    body: AdminCreateConsultationPayloadDto,
  ): Promise<VetConsultation> {
    const { memberId, petId, scheduledAt, services = [], products = [] } = body;

    const member = await this.memberRepo.findOne({ where: { id: memberId } });
    if (!member) {
      throw new NotFoundException(`Member with id "${memberId}" not found`);
    }

    const pet = await this.petRepo.findOne({ where: { id: petId } });
    if (!pet) {
      throw new NotFoundException(`Pet with id "${petId}" not found`);
    }

    // Create a lightweight case so that invoice/details screens
    // can show items and amounts based on serviceChecklist.
    const allItems = [...services, ...products];

    const caseEntity = this.caseRepo.create({
      description: 'Vet admin created visit',
      assets: [],
      notes: [],
      serviceChecklist: allItems.map((item) => ({
        name: item.name,
        checked: false,
        // Extend checklist items with price so frontend can compute totals.
        price: item.price,
      })) as any,
      customerNotReachable: false,
      status: CaseStatusEnum.PENDING,
      isEmergency: false,
      isDirectEscalated: false,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      member: { id: memberId } as any,
      pet: { id: petId } as any,
    });

    const savedCase = await this.caseRepo.save(caseEntity);

    const consultation = this.vetConsultationRepo.create({
      member: { id: memberId } as any,
      status: ConsultationStatusEnum.SCHEDULED,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      case: { id: savedCase.id } as any,
    });

    return this.vetConsultationRepo.save(consultation);
  }

  async findFinanceStats(vetId: string): Promise<{
    totalVisits: number;
    completedVisits: number;
    totalEarnings: number;
    monthlyEarnings: { month: string; amount: number }[];
  }> {
    // Load all consultations for this vet, including linked cases,
    // so we can compute visit counts and earnings.
    const consultations = await this.vetConsultationRepo.find({
      where: { vet: { id: vetId } },
      relations: {
        case: true,
      },
      order: { createdAt: 'ASC' },
    });

    const totalVisits = consultations.length;

    const completed = consultations.filter(
      (c) => c.status === ConsultationStatusEnum.COMPLETED,
    );
    const completedVisits = completed.length;

    // Earnings are derived from the case serviceChecklist "price" field
    // for completed consultations.
    const totalEarnings = completed.reduce((sum, c) => {
      const checklist = (c.case as any)?.serviceChecklist ?? [];
      if (!Array.isArray(checklist)) return sum;
      const caseTotal = checklist.reduce((acc: number, item: any) => {
        const price = typeof item?.price === 'number' ? item.price : 0;
        return acc + price;
      }, 0);
      return sum + caseTotal;
    }, 0);

    // Group earnings by month (e.g. "Mar 2026") from consultation createdAt.
    const monthlyMap = new Map<string, number>();
    for (const c of completed) {
      const created = c.createdAt ? dayJS(c.createdAt) : null;
      if (!created) continue;
      const key = created.format('MMM YYYY');

      const checklist = (c.case as any)?.serviceChecklist ?? [];
      if (!Array.isArray(checklist)) continue;
      const caseTotal = checklist.reduce((acc: number, item: any) => {
        const price = typeof item?.price === 'number' ? item.price : 0;
        return acc + price;
      }, 0);

      monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + caseTotal);
    }

    const monthlyEarnings = Array.from(monthlyMap.entries()).map(
      ([month, amount]) => ({ month, amount }),
    );

    return {
      totalVisits,
      completedVisits,
      totalEarnings,
      monthlyEarnings,
    };
  }
}
