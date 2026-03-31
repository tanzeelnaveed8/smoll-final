import { Injectable } from '@nestjs/common';
import { NotificationService } from '../notification.service';
import {
  PARTNER_BOOKING_CANCELLED_BY_MEMBER,
  PARTNER_BOOKING_CANCELLED_BY_PARTNER,
  PARTNER_BOOKING_SCHEDULED,
  PARTNER_QUOTE_DELETED,
  PARTNER_QUOTE_UPDATED,
  PARTNER_SUBMIT_QUOTE_EVENT,
  PartnerBookingCancelledByMemberEvent,
  PartnerBookingCancelledByPartnerEvent,
  PartnerBookingScheduledEvent,
  PartnerDeleteQuoteEvent,
  PartnerSubmitQuoteEvent,
  PartnerUpdateQuoteEvent,
} from 'src/modules/partner/partner.event';
import { OnEvent } from '@nestjs/event-emitter';
import { RolesEnum } from 'src/guards/role/role.enum';

@Injectable()
export class PartnerListener {
  constructor(private readonly notificationService: NotificationService) {}

  @OnEvent(PARTNER_SUBMIT_QUOTE_EVENT)
  async handlePartnerSubmitQuoteEvent(event: PartnerSubmitQuoteEvent) {
    const { memberId, partnerName } = event;

    this.notificationService.create(memberId, RolesEnum.MEMBER, {
      message: `${partnerName} has submitted their quotation.`,
    });
  }

  @OnEvent(PARTNER_QUOTE_UPDATED)
  async handlePartnerUpdateQuoteEvent(event: PartnerUpdateQuoteEvent) {
    const { memberId, partnerName } = event;

    this.notificationService.create(memberId, RolesEnum.MEMBER, {
      message: `${partnerName} has updated their request.`,
    });
  }

  @OnEvent(PARTNER_QUOTE_DELETED)
  async handlePartnerDeleteQuoteEvent(event: PartnerDeleteQuoteEvent) {
    const { memberId, partnerName } = event;

    this.notificationService.create(memberId, RolesEnum.MEMBER, {
      message: `${partnerName} has deleted their request.`,
    });
  }

  @OnEvent(PARTNER_BOOKING_SCHEDULED)
  async handlePartnerBookingScheduledEvent(
    event: PartnerBookingScheduledEvent,
  ) {
    const { partnerId, memberName } = event;

    this.notificationService.create(partnerId, RolesEnum.PARTNER, {
      message: `${memberName} has scheduled a booking.`,
    });
  }

  @OnEvent(PARTNER_BOOKING_CANCELLED_BY_MEMBER)
  async handlePartnerBookingCancelledByMemberEvent(
    event: PartnerBookingCancelledByMemberEvent,
  ) {
    const { partnerId, memberName } = event;

    this.notificationService.create(partnerId, RolesEnum.PARTNER, {
      message: `${memberName} has cancelled the booking.`,
    });
  }

  @OnEvent(PARTNER_BOOKING_CANCELLED_BY_PARTNER)
  async handlePartnerBookingCancelledByPartnerEvent(
    event: PartnerBookingCancelledByPartnerEvent,
  ) {
    const { memberId, partnerName } = event;

    this.notificationService.create(memberId, RolesEnum.MEMBER, {
      message: `${partnerName} has cancelled the booking, you will be refunded.`,
    });
  }
}
