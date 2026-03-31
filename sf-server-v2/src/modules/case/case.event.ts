export const CASE_CREATED_EVENT = 'case.created';
export const CASE_REJECTED_EVENT = 'case.rejected';
export const CASE_CLOSED_EVENT = 'case.closed';
export const CASE_ESCALATED_EVENT = 'case.escalated';
export const CASE_EMERGENCY_ESCALATION_EVENT = 'case.emergency.escalation';
export class CaseCreatedEvent {
  constructor(
    public readonly userName: string,
    public readonly userId: string,
    public readonly vetId: string,
  ) {}
}

export class CaseClosedEvent {
  constructor(
    public readonly vetName: string,
    public readonly memberId: string,
    public readonly petName: string,
  ) {}
}

export class CaseRejectedEvent {
  constructor(
    public readonly vetName: string,
    public readonly vetId: string,
    public readonly userId: string,
  ) {}
}

export class CaseEscalatedEvent {
  constructor(
    public readonly memberId: string,
    public readonly partnerIds: string[],
    public readonly vetName: string,
    public readonly petName: string,
  ) {}
}

export class CaseEmergencyEscalationEvent {
  constructor(
    public readonly partnerId: string,
    public readonly partnerName: string,
    public readonly petName: string,
    public readonly isEmergency: boolean,
  ) {}
}
