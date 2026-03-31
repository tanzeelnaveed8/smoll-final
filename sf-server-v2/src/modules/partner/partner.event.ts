export const PARTNER_SUBMIT_QUOTE_EVENT = 'partner.submit.quote';
export const PARTNER_BOOKING_SCHEDULED = 'partner.booking.scheduled';
export const PARTNER_BOOKING_CANCELLED_BY_MEMBER =
  'partner.booking.cancelled.by.member';
export const PARTNER_BOOKING_CANCELLED_BY_PARTNER =
  'partner.booking.cancelled.by.partner';
export const PARTNER_QUOTE_UPDATED = 'partner.quote.updated';
export const PARTNER_QUOTE_DELETED = 'partner.quote.deleted';

export class PartnerSubmitQuoteEvent {
  constructor(
    public readonly memberId: string,
    public readonly partnerName: string,
  ) {}
}

export class PartnerUpdateQuoteEvent {
  constructor(
    public readonly memberId: string,
    public readonly partnerName: string,
  ) {}
}

export class PartnerDeleteQuoteEvent {
  constructor(
    public readonly memberId: string,
    public readonly partnerName: string,
  ) {}
}

export class PartnerBookingScheduledEvent {
  constructor(
    public readonly partnerId: string,
    public readonly memberName: string,
  ) {}
}

export class PartnerBookingCancelledByMemberEvent {
  constructor(
    public readonly partnerId: string,
    public readonly memberName: string,
  ) {}
}

export class PartnerBookingCancelledByPartnerEvent {
  constructor(
    public readonly memberId: string,
    public readonly partnerName: string,
  ) {}
}
