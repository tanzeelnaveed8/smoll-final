import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthUser } from 'src/decorators/get-user.decorator';
import { PwdService } from '../../../modules/auth/services/pwd.service';
import { CreateAvailabilityDto } from 'src/modules/vet/dtos/create.dto';
import { VetAvailability } from 'src/modules/vet/entities/vet.availability.entity';
import {
  Between,
  FindOptionsRelations,
  FindOptionsWhere,
  Repository,
  In,
} from 'typeorm';
import {
  CreatePartnerServicePayloadDto,
  CreatePartnerVetPayloadDto,
} from '../dto/create.dto';
import {
  UpdatePartnerPayloadDto,
  UpdatePartnerServicePayloadDto,
  UpdatePartnerVetPayloadDto,
} from '../dto/update.dto';
import { PartnerCost } from '../entities/partner.cost.entity';
import { Partner } from '../entities/partner.entity';
import { PartnerServices } from '../entities/partner.services.entity';
import { PartnerVet } from '../entities/partner.vet.entity';
import { PartnerSpeciality } from '../entities/partner.speciality.entity';
import { PartnerBooking } from '../entities/partner.booking.entity';
import { BookingStatusEnum } from '../booking-status.enum';
import { FindAppointmentCalendarQueryDto } from '../dto/find.dto';
import dayJS from 'src/utils/dayjs';
import { StripeService } from 'src/modules/stripe/stripe.service';
import { NotificationService } from 'src/modules/notification/notification.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  PARTNER_BOOKING_CANCELLED_BY_PARTNER,
  PartnerBookingCancelledByPartnerEvent,
} from '../partner.event';
import { appointmentReminderTemplate } from 'src/utils/emailTemplate';
import { Logger } from 'src/configs/logger';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

@Injectable()
export class PartnerService {
  private readonly logger = Logger.getInstance();

  constructor(
    @InjectRepository(Partner)
    private readonly partnerRepo: Repository<Partner>,
    @InjectRepository(PartnerVet)
    private readonly partnerVetRepo: Repository<PartnerVet>,
    @InjectRepository(VetAvailability)
    private readonly vetAvailabiltyRepo: Repository<VetAvailability>,
    @InjectRepository(PartnerServices)
    private readonly partnerServiceRepo: Repository<PartnerServices>,
    @InjectRepository(PartnerCost)
    private readonly partnerCostRepo: Repository<PartnerCost>,
    @InjectRepository(PartnerSpeciality)
    private readonly partnerSpecialityRepo: Repository<PartnerSpeciality>,
    @InjectRepository(PartnerBooking)
    private readonly partnerBookingRepo: Repository<PartnerBooking>,
    private readonly pwdService: PwdService,
    private readonly stripeService: StripeService,
    private readonly notificationService: NotificationService,
    private readonly eventEmitter: EventEmitter2,
  ) { }

  async findAll(): Promise<Partner[]> {
    this.logger.info('[LOG: PARTNER_SERVICE] findAll called');
    const where: FindOptionsWhere<Partner> = {};
    const partners = await this.partnerRepo.find({ where });
    this.logger.info(
      `[LOG: PARTNER_SERVICE] findAll returned ${partners.length} partners`,
    );
    return partners;
  }

  async findOneByEmail(email: string): Promise<Partner> {
    const partner = await this.partnerRepo.findOne({
      where: { email, isSuspended: false },
    });

    return partner;
  }

  async findOne(id: string): Promise<Partner> {
    this.logger.info(`[LOG: PARTNER_SERVICE] findOne called with id: ${id}`);

    const partner = await this.partnerRepo.findOne({
      where: { id },
      relations: {
        specialities: true,
        vets: true,
      },
    });

    if (!partner) {
      this.logger.warn(
        `[LOG: PARTNER_SERVICE] Partner not found with id: ${id}`,
      );
      throw new NotFoundException('Partner not found');
    }

    this.logger.info(`[LOG: PARTNER_SERVICE] Partner found with id: ${id}`);

    return partner;
  }

  async findOneCost(
    partner: AuthUser,
    id: string,
    caseId: string,
  ): Promise<PartnerCost> {
    this.logger.info(
      `[LOG: PARTNER_SERVICE] findOneCost called with partnerId: ${partner.id}, costId: ${id}, caseId: ${caseId}`,
    );
    const quote = await this.partnerCostRepo.findOne({
      where: {
        id,
        partner: {
          id: partner.id,
        },
        case: {
          id: caseId,
        },
      },
      relations: {
        case: {
          member: true,
        },
      },
      select: {
        id: true,
        services: true,
        note: true,
        case: {
          id: true,
          member: {
            id: true,
            name: true,
            playerId: true,
          },
        },
        partner: {
          id: true,
          name: true,
        },
      },
    });
    if (!quote) {
      this.logger.warn(
        `[LOG: PARTNER_SERVICE] Quote not found with id: ${id} for caseId: ${caseId}`,
      );
      throw new NotFoundException(`Quote with id ${id} not found`);
    }
    this.logger.info(
      `[LOG: PARTNER_SERVICE] Quote found with id: ${id} for caseId: ${caseId}`,
    );
    return quote;
  }

  async update(id: string, body: UpdatePartnerPayloadDto): Promise<Partner> {
    this.logger.info(
      `[LOG: PARTNER_SERVICE] update called with id: ${id} and body: ${JSON.stringify(body)}`,
    );
    const partner = await this.findOne(id);
    const { specialities, ...rest } = body;

    const _body = { ...rest };

    if (body.password) {
      const comparePassword = await this.pwdService.comparePwd(
        body.oldPassword,
        partner.password,
      );

      if (!comparePassword || !body.oldPassword) {
        this.logger.warn(
          `[LOG: PARTNER_SERVICE] Invalid password attempt for partner id: ${id}`,
        );
        throw new BadRequestException('Invalid password');
      }

      const hashedPassword = await this.pwdService.hashPwd(body.password);
      _body.password = hashedPassword;
      this.logger.info(
        `[LOG: PARTNER_SERVICE] Password updated for partner id: ${id}`,
      );
    }

    const newSpecialities = specialities
      ? specialities.map((id) => ({ id: parseInt(id) }) as PartnerSpeciality)
      : partner.specialities;

    const _partner = await this.partnerRepo.save({
      ...partner,
      ..._body,
      specialities: newSpecialities,
    });

    this.logger.info(`[LOG: PARTNER_SERVICE] Partner updated with id: ${id}`);
    return _partner;
  }

  async updateCost(
    partner: AuthUser,
    id: string,
    caseId: string,
    services?: {
      id: string;
      name: string;
      description: string;
      price: number;
      label: string;
    }[],
    note?: string,
  ): Promise<PartnerCost> {
    this.logger.info(
      `[LOG: PARTNER_SERVICE] updateCost called with partnerId: ${partner.id}, costId: ${id}, caseId: ${caseId}`,
    );
    const cost = await this.findOneCost(partner, id, caseId);

    await this.partnerCostRepo.save({
      ...cost,
      services,
      note,
    });

    this.logger.info(
      `[LOG: PARTNER_SERVICE] PartnerCost updated with id: ${id}`,
    );
    return cost;
  }

  async createCost(
    partner: AuthUser,
    caseId: string,
    services: {
      id: string;
      name: string;
      description: string;
      price: number;
      label: string;
    }[],
    note: string,
    meta?: {
      partnerVetId?: string;
      scheduledAt?: Date;
    },
  ): Promise<PartnerCost> {
    this.logger.info(
      `[LOG: PARTNER_SERVICE] createCost called with partnerId: ${partner.id}, caseId: ${caseId}`,
    );

    const existingCost = await this.partnerCostRepo.find({
      where: {
        partner: { id: partner.id },
        case: { id: caseId },
      },
    });

    if (existingCost.length) {
      this.logger.warn(
        `[LOG: PARTNER_SERVICE] Cost already exists for caseId: ${caseId}`,
      );
      throw new BadRequestException(
        'Quote already exists for case with id ' + caseId,
      );
    }

    const cost = this.partnerCostRepo.create({
      partner: { id: partner.id },
      case: { id: caseId },
      services,
      note,
      meta,
    });

    const savedCost = await this.partnerCostRepo.save(cost);
    this.logger.info(
      `[LOG: PARTNER_SERVICE] PartnerCost created with id: ${savedCost.id}`,
    );
    return savedCost;
  }

  async deleteCost(
    partner: AuthUser,
    id: string,
    caseId: string,
  ): Promise<PartnerCost> {
    this.logger.info(
      `[LOG: PARTNER_SERVICE] deleteCost called with partnerId: ${partner.id}, costId: ${id}, caseId: ${caseId}`,
    );
    const cost = await this.findOneCost(partner, id, caseId);
    await this.partnerCostRepo.delete(cost.id);
    this.logger.info(
      `[LOG: PARTNER_SERVICE] PartnerCost deleted with id: ${id}`,
    );
    return cost;
  }

  /**
   * This creates/updates availability
   */
  async createAvailability(
    partner: AuthUser,
    vetId: string,
    body: CreateAvailabilityDto,
  ): Promise<VetAvailability[]> {
    this.logger.info(
      `[LOG: PARTNER_SERVICE] createAvailability called with partnerId: ${partner.id}, vetId: ${vetId}`,
    );
    const { availability } = body;

    await this.findOneVet(partner, vetId);

    const availabilities: VetAvailability[] = [];

    for (const day of Object.keys(availability)) {
      const isDate = day.length > 5;
      const where: FindOptionsWhere<VetAvailability> = isDate
        ? { partnerVet: { id: vetId }, date: new Date(day) }
        : { partnerVet: { id: vetId }, dayOfWeek: day };

      // Validate intervals
      const validIntervals = availability[day].filter((interval) => {
        const start = new Date(`1970-01-01T${interval.from}Z`);
        const end = new Date(`1970-01-01T${interval.to}Z`);

        return start < end;
      });

      if (validIntervals.length !== availability[day].length) {
        this.logger.warn(
          `[LOG: PARTNER_SERVICE] Invalid intervals provided for ${day}`,
        );
        throw new BadRequestException(`Invalid intervals provided for ${day}`);
      }

      const existingAvailability = await this.vetAvailabiltyRepo.findOne({
        where,
      });

      if (existingAvailability) {
        // Update existing availability
        existingAvailability.intervals = availability[day];
        availabilities.push(existingAvailability);
        this.logger.info(
          `[LOG: PARTNER_SERVICE] Updated availability for ${day}`,
        );
      } else {
        // Create new availability
        availabilities.push(
          this.vetAvailabiltyRepo.create({
            partnerVet: { id: vetId },
            dayOfWeek: isDate ? null : day,
            date: isDate ? new Date(day) : null,
            intervals: availability[day],
          }),
        );
        this.logger.info(
          `[LOG: PARTNER_SERVICE] Created availability for ${day}`,
        );
      }
    }

    const savedAvailabilities =
      await this.vetAvailabiltyRepo.save(availabilities);
    this.logger.info(
      `[LOG: PARTNER_SERVICE] Availabilities created/updated for vetId: ${vetId}, total records: ${savedAvailabilities.length}`,
    );
    return savedAvailabilities;
  }

  async findOneVet(
    partner: AuthUser,
    id: string,
    relations?: FindOptionsRelations<PartnerVet>,
  ): Promise<PartnerVet> {
    this.logger.info(
      `[LOG: PARTNER_SERVICE] findOneVet called with partnerId: ${partner.id}, vetId: ${id}`,
    );
    const vet = await this.partnerVetRepo.findOne({
      where: { id, partner: { id: partner.id } },
      relations,
    });

    if (!vet) {
      this.logger.warn(
        `[LOG: PARTNER_SERVICE] Vet not found with id: ${id} for partnerId: ${partner.id}`,
      );
      throw new NotFoundException('Vet not found');
    }

    this.logger.info(
      `[LOG: PARTNER_SERVICE] Vet found with id: ${id} for partnerId: ${partner.id}`,
    );
    return vet;
  }

  async findAllVets(partner: AuthUser): Promise<PartnerVet[]> {
    this.logger.info(
      `[LOG: PARTNER_SERVICE] findAllVets called for partnerId: ${partner.id}`,
    );

    const vets = await this.partnerVetRepo.find({
      where: { partner: { id: partner.id } },
      relations: {
        availabilities: true,
      },
    });

    this.logger.info(
      `[LOG: PARTNER_SERVICE] findAllVets returned ${vets.length} vets for partnerId: ${partner.id}`,
    );
    return vets;
  }

  async sendReminder(partner: AuthUser, bookingId: string): Promise<void> {
    this.logger.info(
      `[LOG: PARTNER_SERVICE] sendReminder called with partnerId: ${partner.id}, bookingId: ${bookingId}`,
    );
    const booking = await this.partnerBookingRepo.findOne({
      where: { id: bookingId, partner: { id: partner.id } },
      relations: {
        member: true,
        partner: true,
      },
    });

    if (!booking) {
      this.logger.warn(
        `[LOG: PARTNER_SERVICE] Booking not found with id: ${bookingId} for partnerId: ${partner.id}`,
      );
      throw new NotFoundException(`Booking with id ${bookingId} not found`);
    }

    try {
      this.notificationService.sendOneSignalNotification({
        heading: 'Reminder',
        message: `🔔 Reminder: You have an upcoming appointment with ${booking.partner.name}.`,
        playerId: booking.member.playerId,
        meta: {
          notificationType: 'partner-booking-reminder',
          partnerBookingId: booking.id,
        },
      });
      this.logger.info(
        `[LOG: PARTNER_SERVICE] OneSignal reminder sent for bookingId: ${bookingId}`,
      );
    } catch (error) {
      this.logger.error(
        `[LOG: PARTNER_SERVICE] Error sending OneSignal notification:`,
        error,
      );
    }

    try {
      this.notificationService.sendSmsNotification(
        booking.member.phone,
        `🔔 Reminder: You have an upcoming appointment with ${booking.partner.name}.`,
      );
      this.logger.info(
        `[LOG: PARTNER_SERVICE] SMS reminder sent to phone: ${booking.member.phone} for bookingId: ${bookingId}`,
      );
    } catch (error) {
      this.logger.error(
        `[LOG: PARTNER_SERVICE] Error sending SMS notification:`,
        error,
      );
    }

    if (booking.member.email) {
      try {
        const memberTimeZone = booking.member.timeZone || 'GMT +04:00';
        const memberOffset = this.parseOffset(memberTimeZone);

        const memberLocalTime = dayjs(booking.scheduledAt)
          .utcOffset(memberOffset)
          .format('DD MMMM YYYY, hh:mm A');

        this.notificationService.sendEmailNotification(
          booking.member.email,
          'Smoll: You have an upcoming appointment',
          appointmentReminderTemplate(
            booking.member.name,
            booking.partner.name,
            memberLocalTime,
            booking.partner.phone,
            booking.member.email,
            booking.partner.address,
          ),
        );
        this.logger.info(
          `[LOG: PARTNER_SERVICE] Email reminder sent to: ${booking.member.email} for bookingId: ${bookingId}`,
        );
      } catch (error) {
        this.logger.error(
          `[LOG: PARTNER_SERVICE] Error sending email notification:`,
          error,
        );
      }
    }
  }

  private parseOffset(timezone: string): number {
    this.logger.debug(
      `[LOG: PARTNER_SERVICE] parseOffset called with timezone: ${timezone}`,
    );
    const match = timezone.match(/GMT\s*([+-]\d{2}):(\d{2})/);
    if (match) {
      const [, hours, minutes] = match;
      const offset = parseInt(hours, 10) * 60 + parseInt(minutes, 10);
      this.logger.debug(
        `[LOG: PARTNER_SERVICE] Parsed offset: ${offset} minutes`,
      );
      return offset;
    }
    this.logger.warn(
      `[LOG: PARTNER_SERVICE] Failed to parse timezone: ${timezone}, defaulting to UTC`,
    );
    return 0; // Default to UTC if parsing fails
  }

  async findAllAppointments(partner: AuthUser) {
    this.logger.info(
      `[LOG: PARTNER_SERVICE] findAllAppointments called for partnerId: ${partner.id}`,
    );
    const appointments = await this.partnerBookingRepo.find({
      where: {
        partner: { id: partner.id },
        status: BookingStatusEnum.INITIATED,
      },
      relations: {
        member: true,
        case: true,
      },
      select: {
        id: true,
        scheduledAt: true,
        case: {
          id: true,
        },
        member: {
          id: true,
          name: true,
        },
        createdAt: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    this.logger.info(
      `[LOG: PARTNER_SERVICE] findAllAppointments retrieved ${appointments.length} appointments for partnerId: ${partner.id}`,
    );

    const result = appointments.map((appointment) => ({
      ...appointment,
      isNew: dayJS().diff(dayJS(appointment.createdAt), 'day') < 3,
    }));

    this.logger.debug(
      `[LOG: PARTNER_SERVICE] findAllAppointments processed appointments for partnerId: ${partner.id}`,
    );
    return result;
  }

  async findAppointmentCalendar(
    partner: AuthUser,
    query: FindAppointmentCalendarQueryDto,
  ): Promise<{
    appointments: PartnerBooking[];
    lastDate: string | null;
  }> {
    this.logger.info(
      `[LOG: PARTNER_SERVICE] findAppointmentCalendar called with partnerId: ${partner.id}, query: ${JSON.stringify(query)}`,
    );
    const { startDate, type, vetId } = query;

    const start = dayJS(startDate);
    const end = type === 'monthly' ? start.add(30, 'day') : start.add(7, 'day');

    const appointments = await this.partnerBookingRepo.find({
      where: {
        partner: { id: partner.id },
        scheduledAt: Between(start.toDate(), end.toDate()),
        status: BookingStatusEnum.INITIATED,
        vet: vetId ? { id: vetId } : undefined,
      },
      relations: {
        member: true,
        case: true,
        vet: true,
      },
      select: {
        id: true,
        scheduledAt: true,
        member: {
          id: true,
          name: true,
        },
        case: {
          id: true,
        },
        vet: {
          id: true,
          name: true,
          labelColor: true,
        },
      },
      order: {
        scheduledAt: 'ASC',
      },
    });

    const lastDate = end.toISOString();

    this.logger.info(
      `[LOG: PARTNER_SERVICE] findAppointmentCalendar retrieved ${appointments.length} appointments for partnerId: ${partner.id}`,
    );
    return {
      appointments,
      lastDate,
    };
  }

  async closeAppointment(partner: AuthUser, id: string): Promise<void> {
    this.logger.info(
      `[LOG: PARTNER_SERVICE] closeAppointment called with partnerId: ${partner.id}, bookingId: ${id}`,
    );
    const booking = await this.partnerBookingRepo.findOne({
      where: { id, partner: { id: partner.id } },
    });

    if (!booking) {
      this.logger.warn(
        `[LOG: PARTNER_SERVICE] Booking not found with id: ${id} for partnerId: ${partner.id}`,
      );
      throw new NotFoundException(`Booking with id ${id} not found`);
    }

    booking.status = BookingStatusEnum.COMPLETED;

    await this.partnerBookingRepo.save(booking);
    this.logger.info(
      `[LOG: PARTNER_SERVICE] Booking status updated to COMPLETED for bookingId: ${id}`,
    );
  }

  async cancelAppointment(partner: AuthUser, id: string): Promise<void> {
    this.logger.info(
      `[LOG: PARTNER_SERVICE] cancelAppointment called with partnerId: ${partner.id}, bookingId: ${id}`,
    );
    const booking = await this.partnerBookingRepo.findOne({
      where: {
        id,
        partner: { id: partner.id },
        status: BookingStatusEnum.INITIATED,
      },
      relations: {
        member: true,
        partner: true,
      },
      select: {
        id: true,
        scheduledAt: true,
        paymentIntentId: true,
        status: true,
        member: {
          id: true,
          name: true,
          playerId: true,
        },
        partner: {
          id: true,
          name: true,
        },
      },
    });

    if (!booking) {
      this.logger.warn(
        `[LOG: PARTNER_SERVICE] Booking not found with id: ${id} for cancelation`,
      );
      throw new NotFoundException(`Booking with id ${id} not found`);
    }

    if (dayJS(booking.scheduledAt).isBefore(dayJS())) {
      this.logger.warn(
        `[LOG: PARTNER_SERVICE] Attempt to cancel past scheduled appointment with id: ${id}`,
      );
      throw new BadRequestException(
        'Cannot cancel appointment past scheduled time.',
      );
    }

    booking.status = BookingStatusEnum.CANCELLED;

    await this.stripeService.createRefund(booking.paymentIntentId);
    await this.partnerBookingRepo.save(booking);

    this.logger.info(
      `[LOG: PARTNER_SERVICE] Booking cancelled and refund initiated for bookingId: ${id}`,
    );

    try {
      this.notificationService.sendOneSignalNotification({
        heading: 'Booking cancelled',
        message: `😟 Your booking has been cancelled by the partner. You will be refunded.`,
        playerId: booking.member.playerId,
      });
      this.logger.info(
        `[LOG: PARTNER_SERVICE] OneSignal cancellation notification sent for bookingId: ${id}`,
      );
    } catch (error) {
      this.logger.error(
        `[LOG: PARTNER_SERVICE] Error sending OneSignal cancellation notification:`,
        error,
      );
    }

    this.eventEmitter.emit(
      PARTNER_BOOKING_CANCELLED_BY_PARTNER,
      new PartnerBookingCancelledByPartnerEvent(
        booking.member.id,
        booking.partner.name,
      ),
    );
    this.logger.info(
      `[LOG: PARTNER_SERVICE] Event emitted for booking cancellation: ${PARTNER_BOOKING_CANCELLED_BY_PARTNER}`,
    );
  }

  async createVet(
    partner: AuthUser,
    body: CreatePartnerVetPayloadDto,
  ): Promise<PartnerVet> {
    this.logger.info(
      `[LOG: PARTNER_SERVICE] createVet called with partnerId: ${partner.id} and body: ${JSON.stringify(body)}`,
    );
    const { availabilities, ...rest } = body;

    const vet = this.partnerVetRepo.create({
      ...rest,
      partner: { id: partner.id },
    });

    const _vet = await this.partnerVetRepo.save(vet);
    this.logger.info(
      `[LOG: PARTNER_SERVICE] Vet created with id: ${_vet.id} for partnerId: ${partner.id}`,
    );

    await this.createAvailability(partner, _vet.id, availabilities);
    this.logger.info(
      `[LOG: PARTNER_SERVICE] Availabilities set for vetId: ${_vet.id}`,
    );

    return _vet;
  }

  async updateVet(
    partner: AuthUser,
    id: string,
    body: UpdatePartnerVetPayloadDto,
  ): Promise<PartnerVet> {
    this.logger.info(
      `[LOG: PARTNER_SERVICE] updateVet called with partnerId: ${partner.id}, vetId: ${id}, and body: ${JSON.stringify(body)}`,
    );
    const { availabilities, ...rest } = body;
    const vet = await this.findOneVet(partner, id);

    const _vet = await this.partnerVetRepo.save({
      ...vet,
      ...rest,
    });
    this.logger.info(
      `[LOG: PARTNER_SERVICE] Vet updated with id: ${id} for partnerId: ${partner.id}`,
    );

    await this.createAvailability(partner, _vet.id, availabilities);
    this.logger.info(
      `[LOG: PARTNER_SERVICE] Availabilities updated for vetId: ${_vet.id}`,
    );

    return _vet;
  }

  async findAllSpecialities(): Promise<PartnerSpeciality[]> {
    this.logger.info('[LOG: PARTNER_SERVICE] findAllSpecialities called');
    const specialities = await this.partnerSpecialityRepo.find();
    this.logger.info(
      `[LOG: PARTNER_SERVICE] findAllSpecialities returned ${specialities.length} specialities`,
    );
    return specialities;
  }

  async findAllServices(partner: AuthUser): Promise<PartnerServices[]> {
    this.logger.info(
      `[LOG: PARTNER_SERVICE] findAllServices called for partnerId: ${partner.id}`,
    );
    const services = await this.partnerServiceRepo.find({
      where: { partner: { id: partner.id } },
    });
    this.logger.info(
      `[LOG: PARTNER_SERVICE] findAllServices returned ${services.length} services for partnerId: ${partner.id}`,
    );
    return services;
  }

  async findOneService(
    partner: AuthUser,
    id: string,
  ): Promise<PartnerServices> {
    this.logger.info(
      `[LOG: PARTNER_SERVICE] findOneService called with partnerId: ${partner.id}, serviceId: ${id}`,
    );
    const service = await this.partnerServiceRepo.findOne({
      where: { id: parseInt(id), partner: { id: partner.id } },
    });

    if (!service) {
      this.logger.warn(
        `[LOG: PARTNER_SERVICE] Service not found with id: ${id} for partnerId: ${partner.id}`,
      );
      throw new NotFoundException(`Service with id ${id} not found`);
    }

    this.logger.info(
      `[LOG: PARTNER_SERVICE] Service found with id: ${id} for partnerId: ${partner.id}`,
    );
    return service;
  }

  async createService(
    partner: AuthUser,
    body: CreatePartnerServicePayloadDto,
  ): Promise<PartnerServices> {
    this.logger.info(
      `[LOG: PARTNER_SERVICE] createService called for partner ${partner.id} with body: ${JSON.stringify(body)}`,
    );

    const service = this.partnerServiceRepo.create({
      ...body,
      partner: { id: partner.id },
    });

    const _service = await this.partnerServiceRepo.save(service);

    this.logger.info(
      `[LOG: PARTNER_SERVICE] Service created with id: ${_service.id} for partner ${partner.id}`,
    );

    return _service;
  }

  /**
   * Creates multiple services by uploading only those that do not already exist based on the title.
   * Returns the count of successfully uploaded and rejected services.
   */
  async createBulkService(
    partner: AuthUser,
    body: CreatePartnerServicePayloadDto[],
  ): Promise<{ uploaded: number; failed: number }> {
    this.logger.info(
      `[LOG: PARTNER_SERVICE] createBulkServiceUnique called for partner ${partner.id} with body: ${JSON.stringify(body)}`,
    );

    // Extract titles from the incoming services
    const incomingTitles = body.map((service) => service.title);

    // Fetch existing services with titles that match the incoming titles
    const existingServices = await this.partnerServiceRepo.find({
      where: { title: In(incomingTitles), partner: { id: partner.id } },
      select: ['title'],
    });

    const existingTitles = new Set(
      existingServices.map((service) => service.title),
    );

    // Filter out services that already exist
    const newServices = body.filter(
      (service) => !existingTitles.has(service.title),
    );

    // Prepare services for insertion
    const servicesToInsert = newServices.map((service) => ({
      ...service,
      partner: { id: partner.id },
    }));

    // Save new services
    const uploadedServices =
      await this.partnerServiceRepo.save(servicesToInsert);

    this.logger.info(
      `[LOG: PARTNER_SERVICE] Services uploaded with ids: ${uploadedServices.map((service) => service.id)} for partner ${partner.id}`,
    );

    // Calculate rejected count
    const rejectedCount = body.length - newServices.length;

    return {
      uploaded: uploadedServices.length,
      failed: rejectedCount,
    };
  }

  async updateService(
    partner: AuthUser,
    id: string,
    body: UpdatePartnerServicePayloadDto,
  ): Promise<PartnerServices> {
    this.logger.info(
      `[LOG: PARTNER_SERVICE] updateService called for partner ${partner.id}, serviceId: ${id} with body: ${JSON.stringify(body)}`,
    );
    const service = await this.findOneService(partner, id);

    this.logger.info(
      `[LOG: PARTNER_SERVICE] Updating service with id: ${id} for partner ${partner.id}`,
    );

    const _service = await this.partnerServiceRepo.save({
      ...service,
      ...body,
    });

    this.logger.info(
      `[LOG: PARTNER_SERVICE] Service updated with id: ${id} for partner ${partner.id}`,
    );

    return _service;
  }

  async deleteService(partner: AuthUser, id: string): Promise<void> {
    this.logger.info(
      `[LOG: PARTNER_SERVICE] deleteService called with partnerId: ${partner.id}, serviceId: ${id}`,
    );
    const service = await this.findOneService(partner, id);
    await this.partnerServiceRepo.delete(service.id);
    this.logger.info(
      `[LOG: PARTNER_SERVICE] Service deleted with id: ${id} for partnerId: ${partner.id}`,
    );
  }

  async deleteVet(partner: AuthUser, id: string): Promise<void> {
    this.logger.info(
      `[LOG: PARTNER_SERVICE] deleteVet called with partnerId: ${partner.id}, vetId: ${id}`,
    );
    const vet = await this.findOneVet(partner, id);
    await this.partnerVetRepo.delete(vet.id);
    this.logger.info(
      `[LOG: PARTNER_SERVICE] Vet deleted with id: ${id} for partnerId: ${partner.id}`,
    );
  }
}
