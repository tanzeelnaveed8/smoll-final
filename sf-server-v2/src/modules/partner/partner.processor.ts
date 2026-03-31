import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationService } from '../notification/notification.service';
import { PartnerBooking } from './entities/partner.booking.entity';
import { BookingStatusEnum } from './booking-status.enum';

export enum PartnerJobNameEnum {
  BOOKING_SCHEDULED = 'booking-scheduled',
  BOOKING_CLOSED = 'booking-closed',
}

@Injectable()
@Processor('partner')
export class PartnerProcessor extends WorkerHost {
  constructor(
    @InjectRepository(PartnerBooking)
    private readonly partnerBookingRepo: Repository<PartnerBooking>,
    private readonly notificationService: NotificationService,
  ) {
    super();
  }

  async process(job: Job<any, any, PartnerJobNameEnum>): Promise<void> {
    switch (job.name) {
      case PartnerJobNameEnum.BOOKING_SCHEDULED:
        await this.handleBookingScheduled(job);
        break;
      case PartnerJobNameEnum.BOOKING_CLOSED:
        await this.handleBookingClosed(job);
        break;
    }
  }

  private async handleBookingScheduled(job) {
    const booking = await this.partnerBookingRepo.findOne({
      where: { id: job.data.bookingId },
      relations: {
        member: true,
      },
    });

    if (
      booking &&
      booking.scheduledAt &&
      booking.status === BookingStatusEnum.INITIATED
    ) {
      if (booking.member.playerId) {
        // Send notification using your notification service
        await this.notificationService.sendOneSignalNotification({
          playerId: booking.member.playerId,
          heading: `🐾 ${booking.partner.name} consultation`,
          message: `🚨 Your ${booking.partner.name} consultation is about to start in 10 minutes! 🕐`,
          icon: booking.partner.clinicImg.url,
          meta: {
            bookingId: booking.id,
            notificationType: PartnerJobNameEnum.BOOKING_SCHEDULED,
          },
        });
      }
    }
  }

  private async handleBookingClosed(job) {
    const booking = await this.partnerBookingRepo.findOne({
      where: { id: job.data.bookingId },
    });

    if (booking) {
      booking.status = BookingStatusEnum.COMPLETED;
      await this.partnerBookingRepo.save(booking);
    }
  }
}
