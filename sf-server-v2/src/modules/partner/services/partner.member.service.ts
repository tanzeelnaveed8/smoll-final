import { InjectQueue } from '@nestjs/bullmq';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bullmq';
import { AuthUser } from 'src/decorators/get-user.decorator';
import { CaseStatusEnum } from 'src/modules/case/enums/case-status.enum';
import { StripeService } from 'src/modules/stripe/stripe.service';
import { FindVetAvailabilityQueryDto } from 'src/modules/vet/dtos/find.dto';
import { VetAvailability } from 'src/modules/vet/entities/vet.availability.entity';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import {
  Between,
  FindOptionsRelations,
  FindOptionsWhere,
  ILike,
  In,
  Repository,
} from 'typeorm';
import { BookingStatusEnum } from '../booking-status.enum';
import {
  BookAppointmentPayloadDto,
  BookEmergencyAppointmentPayloadDto,
} from '../dto/create.dto';
import { PartnerBooking } from '../entities/partner.booking.entity';
import { PartnerServices } from '../entities/partner.services.entity';
import { PartnerVet } from '../entities/partner.vet.entity';
import {
  PARTNER_BOOKING_CANCELLED_BY_MEMBER,
  PARTNER_BOOKING_SCHEDULED,
  PartnerBookingCancelledByMemberEvent,
  PartnerBookingScheduledEvent,
} from '../partner.event';
import { PartnerJobNameEnum } from '../partner.processor';
import { PartnerCost } from '../entities/partner.cost.entity';
import { NotificationService } from 'src/modules/notification/notification.service';
import {
  bookingScheduledTemplate,
  bookingScheduledTemplateForPartner,
} from 'src/utils/emailTemplate';
import { Logger } from 'src/configs/logger';
import { Partner } from '../entities/partner.entity';
import { FindFileResDto } from 'src/modules/file/dto/find.dto';
import { FindPartnerPayloadDto } from '../dto/find.dto';

dayjs.extend(utc);

@Injectable()
export class PartnerMemberService {
  private readonly logger = Logger.getInstance();

  constructor(
    @InjectRepository(PartnerVet)
    private readonly partnerVetRepo: Repository<PartnerVet>,
    @InjectRepository(PartnerBooking)
    private readonly partnerBookingRepo: Repository<PartnerBooking>,
    @InjectRepository(VetAvailability)
    private readonly vetAvailabiltyRepo: Repository<VetAvailability>,
    @InjectRepository(PartnerServices)
    private readonly partnerServiceRepo: Repository<PartnerServices>,
    @InjectRepository(PartnerCost)
    private readonly partnerCostRepo: Repository<PartnerCost>,
    @InjectRepository(Partner)
    private readonly partnerRepo: Repository<Partner>,
    @InjectQueue('partner')
    private readonly partnerQueue: Queue,
    private readonly stripeService: StripeService,
    private readonly eventEmitter: EventEmitter2,
    private readonly notificationService: NotificationService,
  ) { }

  async findAllVet(partnerId: string): Promise<PartnerVet[]> {
    const vets = await this.partnerVetRepo.find({
      where: {
        partner: { id: partnerId },
      },
      select: {
        id: true,
        name: true,
        about: true,
        designation: true,
        yearsOfExperience: true,
        profileImg: {},
      },
    });

    return vets;
  }

  async findAllPartner(query: FindPartnerPayloadDto) {
    const { search, city } = query;

    const whereConditions: any = {
      isSuspended: false,
    };

    if (search) {
      whereConditions.name = ILike(`%${search}%`);
    }

    if (city) {
      whereConditions.city = ILike(`%${city}%`);
    }

    const partners = await this.partnerRepo.find({
      where: whereConditions,
    });

    return partners;
  }

  async findOneVet(id: string, partnerId: string): Promise<PartnerVet> {
    const vet = await this.partnerVetRepo.findOne({
      where: { id, partner: { id: partnerId } },
      relations: {
        partner: true,
        availabilities: true,
      },
      select: {
        id: true,
        name: true,
        designation: true,
        yearsOfExperience: true,
        profileImg: {},
        partner: {
          address: true,
          name: true,
        },
        availabilities: true,
      },
    });

    if (!vet) {
      throw new NotFoundException(`Vet with id ${id} not found`);
    }

    return vet;
  }

  async findAvailabilities(
    id: string,
    partnerId: string,
    query: FindVetAvailabilityQueryDto,
  ): Promise<VetAvailability[]> {
    const { date } = query;

    await this.findOneVet(id, partnerId);

    try {
      const startDate = date ? new Date(date) : new Date();
      if (isNaN(startDate.getTime())) {
        throw new BadRequestException('Invalid date provided');
      }

      const endDate = new Date(startDate);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      const bookings = await this.partnerBookingRepo.find({
        where: {
          scheduledAt: Between(startDate, endDate),
          status: In([
            BookingStatusEnum.INITIATED,
            BookingStatusEnum.RESCHEDULED,
          ]),
        },
      });

      const where: FindOptionsWhere<VetAvailability>[] = [];

      if (date) {
        const dayOfWeek = startDate
          .toLocaleString('en-US', { weekday: 'short' })
          .toLowerCase();

        where.push(
          { partnerVet: { id }, date: startDate },
          { partnerVet: { id }, dayOfWeek },
        );
      } else {
        where.push({ partnerVet: { id } });
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

            const isSlotAvailable = !bookings.some((booking) => {
              const bookingStart = new Date(booking.scheduledAt);
              const bookingEnd = new Date(bookingStart.getTime() + 15 * 60000);

              // Create slot times using the same date as the booking
              const slotStartTime = new Date(bookingStart);
              slotStartTime.setHours(
                intervalStart.getHours(),
                intervalStart.getMinutes(),
                0,
                0,
              );
              const slotEndTime = new Date(bookingStart);
              slotEndTime.setHours(
                slotEnd.getHours(),
                slotEnd.getMinutes(),
                0,
                0,
              );

              return bookingStart < slotEndTime && bookingEnd > slotStartTime;
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

  async findOneAppointment(
    member: AuthUser,
    id: string,
    relations?: FindOptionsRelations<PartnerBooking>,
  ): Promise<PartnerBooking> {
    const booking = await this.partnerBookingRepo.findOne({
      where: { id, member: { id: member.id } },
      relations,
      select: {
        id: true,
        scheduledAt: true,
        status: true,
        services: true,
        paymentIntentId: true,
        partnerCost: {
          id: true,
          services: true,
        },
        partner: {
          id: true,
          name: true,
          address: true,
          clinicImg: {
            url: true,
            filename: true,
            filesize: true,
            mimetype: true,
          },
          email: true,
          phone: true,
        },
        vet: {
          id: true,
          name: true,
          designation: true,
          profileImg: {},
        },
        case: {
          id: true,
          pet: {
            name: true,
            photos: true,
          },
          isEmergency: true,
        },
        createdAt: true,
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with id ${id} not found`);
    }

    return booking;
  }

  async bookEmergencyAppointment(
    member: AuthUser,
    id: string,
    body: BookEmergencyAppointmentPayloadDto,
  ): Promise<PartnerBooking> {
    const { caseId, services, paymentIntentId, scheduleAt } = body;

    this.logger.info(
      `[LOG: PARTNER_MEMBER_SERVICE] Booking emergency appointment for case ${caseId}`,
    );

    let booking = await this.partnerBookingRepo.findOne({
      where: {
        member: { id: member.id },
        partner: { id },
        status: In([
          BookingStatusEnum.INITIATED,
          BookingStatusEnum.RESCHEDULED,
        ]),
        case: { id: caseId },
      },
    });

    if (booking) {
      this.logger.info(
        `[LOG: PARTNER_MEMBER_SERVICE] Emergency booking already scheduled for case ${caseId}`,
      );

      throw new BadRequestException('Emergency booking already scheduled');
    }

    const partnerCost = await this.partnerCostRepo.findOne({
      where: {
        partner: { id },
        case: { id: caseId },
      },
    });

    if (!partnerCost) {
      this.logger.error(
        `[LOG: PARTNER_MEMBER_SERVICE] Partner quote not found for case ${caseId}`,
      );

      throw new BadRequestException('Partner quote not found');
    }

    const partnerServices = await this.partnerServiceRepo.find({
      where: { partner: { id }, quickBooking: true },
    });

    if (!partnerServices.length) {
      this.logger.error(
        `[LOG: PARTNER_MEMBER_SERVICE] No quick booking services found for partner ${id}`,
      );

      throw new BadRequestException('No quick booking services found');
    }

    const foundServices = partnerServices
      .filter((service) =>
        services.find((s) => s.id.toString() === service.id.toString()),
      )
      .map((service) => ({
        id: service.id.toString(),
        name: service.title,
        description: service.description,
        price: service.price,
        label: services.find((s) => s.id.toString() === service.id.toString())
          ?.label,
      }));

    // For direct escalation no emergency case.
    const partnerVetId = partnerCost.meta?.partnerVetId;
    const scheduledAt = partnerCost.meta?.scheduledAt;

    booking = this.partnerBookingRepo.create({
      scheduledAt: scheduledAt ?? scheduleAt,
      status: BookingStatusEnum.INITIATED,
      member: { id: member.id },
      case: { id: caseId },
      partner: { id },
      vet: partnerVetId ? { id: partnerVetId } : null,
      services: foundServices,
      paymentIntentId,
      partnerCost,
    });

    booking.case.status = CaseStatusEnum.CONFIRMED;
    booking = await this.partnerBookingRepo.save(booking);

    try {
      this._notifyForAppointment(booking.id, false);
    } catch (error) {
      this.logger.error('Error sending email notifications:', error);
    }

    return booking;
  }

  async bookAppointment(
    member: AuthUser,
    id: string,
    vetId: string,
    body: BookAppointmentPayloadDto,
  ): Promise<PartnerBooking> {
    const { scheduleAt, caseId, services, paymentIntentId, bookingId } = body;
    let isRescheduling = false;

    let booking: PartnerBooking;

    const action = bookingId ? 'Rescheduling' : 'Booking';
    this.logger.info(
      `${action} | Member: ${member.id} | Partner: ${id} | Vet: ${vetId}`,
    );

    if (bookingId) {
      booking = await this.partnerBookingRepo.findOne({
        where: { id: bookingId },
        relations: {
          case: true,
        },
      });
    } else {
      booking = await this.partnerBookingRepo.findOne({
        where: {
          member: { id: member.id },
          partner: { id },
          vet: { id: vetId },
          scheduledAt: scheduleAt,
          status: In([
            BookingStatusEnum.INITIATED,
            BookingStatusEnum.RESCHEDULED,
          ]),
          case: { id: caseId },
        },
      });
    }

    const partnerCost = await this.partnerCostRepo.findOne({
      where: {
        partner: { id },
        case: { id: caseId },
      },
    });

    if (booking && booking.status === BookingStatusEnum.INITIATED) {
      throw new BadRequestException('Booking already scheduled at this time');
    }

    if (booking && booking.status === BookingStatusEnum.RESCHEDULED) {
      isRescheduling = true;
    }

    const partnerServices = await this.partnerServiceRepo.find({
      where: { partner: { id } },
    });

    const foundServices = partnerServices
      .filter((service) =>
        services.find((s) => s.id.toString() === service.id.toString()),
      )
      .map((service) => ({
        id: service.id.toString(),
        name: service.title,
        description: service.description,
        price: service.price,
        label: services.find((s) => s.id.toString() === service.id.toString())
          ?.label,
      }));

    if (booking && booking.status === BookingStatusEnum.RESCHEDULED) {
      booking.status = BookingStatusEnum.INITIATED;
      booking.vet = <any>{ id: vetId };
      booking.scheduledAt = scheduleAt;
      booking.services = foundServices;
    } else {
      booking = this.partnerBookingRepo.create({
        scheduledAt: scheduleAt,
        status: BookingStatusEnum.INITIATED,
        member: { id: member.id },
        case: { id: caseId },
        partner: { id },
        vet: { id: vetId },
        services: foundServices,
        paymentIntentId,
        partnerCost,
      });
    }

    booking.case.status = CaseStatusEnum.CONFIRMED;
    booking = await this.partnerBookingRepo.save(booking);

    // remove this case from all other partners
    // mark the case as complete

    // Schedule a job to send a notification 10 minutes before the consultation
    const now = dayjs().utc();
    const bookingTime = dayjs.utc(booking.scheduledAt);
    const notificationTime = bookingTime.subtract(10, 'minutes');
    // const closeTime = bookingTime.add(1, 'hour');

    const delay = Math.max(notificationTime.diff(now), 0);

    this.eventEmitter.emit(
      PARTNER_BOOKING_SCHEDULED,
      new PartnerBookingScheduledEvent(id, member.name),
    );

    await this.partnerQueue.add(
      PartnerJobNameEnum.BOOKING_SCHEDULED,
      {
        bookingId: booking.id,
      },
      { delay, removeOnComplete: true, removeOnFail: true },
    );

    this._notifyForAppointment(booking.id, isRescheduling);

    return booking;
  }

  private parseOffset(timezone: string): number {
    const match = timezone.match(/GMT\s*([+-]\d{2}):(\d{2})/);
    if (match) {
      const [, hours, minutes] = match;
      return parseInt(hours, 10) * 60 + parseInt(minutes, 10);
    }
    return 0; // Default to UTC if parsing fails
  }

  private async _notifyForAppointment(
    bookingId: string,
    isRescheduling: boolean,
  ) {
    try {
      const booking = await this.partnerBookingRepo.findOne({
        where: {
          id: bookingId,
        },
        relations: {
          member: true,
          partner: true,
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
          partner: {
            name: true,
            email: true,
            phone: true,
            address: true,
          },
          vet: {
            name: true,
          },
          member: {
            id: true,
            name: true,
            email: true,
            timeZone: true,
          },
        },
      });

      if (booking.member.email) {
        const memberTimeZone = booking.member.timeZone || 'GMT +04:00';
        const memberOffset = this.parseOffset(memberTimeZone);

        const memberLocalTime = dayjs(booking.scheduledAt)
          .utcOffset(memberOffset)
          .format('DD MMMM YYYY, hh:mm A');

        this.notificationService.sendEmailNotification(
          booking.member.email,
          'Booking Scheduled',
          bookingScheduledTemplate(
            booking.case.id,
            booking.member.name,
            booking.partner.name,
            memberLocalTime,
            booking.partner.phone,
            booking.partner.email,
            booking.partner.address,
            isRescheduling,
          ),
        );
      }

      const partnerTimeZone = 'GMT +04:00'; // TODO: get partner timezone
      const partnerOffset = this.parseOffset(partnerTimeZone);

      const partnerLocalTime = dayjs(booking.scheduledAt)
        .utcOffset(partnerOffset)
        .format('DD MMMM YYYY, hh:mm A');

      this.notificationService.sendEmailNotification(
        booking.partner.email,
        'New Booking',
        bookingScheduledTemplateForPartner(
          booking.partner.name,
          booking.member.name,
          booking.vet?.name,
          partnerLocalTime,
          isRescheduling,
          booking.case.isEmergency ?? false,
        ),
      );
    } catch (error) {
      this.logger.error('Error sending email notifications:', error);
    }
  }

  async cancelAppointment(member: AuthUser, id: string): Promise<void> {
    const booking = await this.findOneAppointment(member, id, {
      partner: true,
    });

    booking.status = BookingStatusEnum.CANCELLED;

    await this.stripeService.createRefund(booking.paymentIntentId);
    await this.partnerBookingRepo.save(booking);

    this.eventEmitter.emit(
      PARTNER_BOOKING_CANCELLED_BY_MEMBER,
      new PartnerBookingCancelledByMemberEvent(booking.partner.id, member.name),
    );
  }

  /**
   * Only updates the status
   */
  async rescheduleAppointment(member: AuthUser, id: string): Promise<void> {
    const booking = await this.findOneAppointment(member, id, {
      partner: true,
    });

    booking.status = BookingStatusEnum.RESCHEDULED;
    booking.scheduledAt = null;

    await this.partnerBookingRepo.save(booking);
  }
}
