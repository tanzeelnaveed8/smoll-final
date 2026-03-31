export const VET_CALL_REQUEST_EVENT = 'vet.call.request';
export const VET_ADDED_CASE_EVENT = 'vet.added.case';
export const VET_CALL_ACCEPT_EVENT = 'vet.call.accept';
export const VET_CALL_REJECT_EVENT = 'vet.call.reject';
export const VET_CALL_INITIATE_EVENT = 'vet.call.initiate';
export const VET_FEEDBACK_CREATED_EVENT = 'vet.feedback.created';
export const VET_CONSULTATION_SCHEDULED_EVENT = 'vet.consultation.scheduled';

export const MEMBER_CANCEL_CONSULTATION_EVENT = 'member.cancel.consultation';

export class VetCallRequestEvent {
  constructor(
    public readonly vetId: string,
    public readonly memberName: string,
  ) {}
}

export class VetCallInitiateEvent {
  constructor(
    public readonly memberId: string,
    public readonly vetName: string,
  ) {}
}
export class VetAddedCaseEvent {
  constructor(
    public readonly vetId: string,
    public readonly memberName: string,
  ) {}
}

export class VetCallAcceptEvent {
  constructor(
    public readonly memberId: string,
    public readonly vetName: string,
  ) {}
}

export class VetCallRejectEvent {
  constructor(
    public readonly memberId: string,
    public readonly vetName: string,
  ) {}
}

export class VetFeedbackCreatedEvent {
  constructor(
    public readonly vetId: string,
    public readonly memberName: string,
    public readonly ratings: number,
  ) {}
}

export class VetConsultationScheduledEvent {
  constructor(
    public readonly vetId: string,
    public readonly memberName: string,
  ) {}
}

export class MemberCancelConsultationEvent {
  constructor(
    public readonly vetId: string,
    public readonly memberName: string,
  ) {}
}
