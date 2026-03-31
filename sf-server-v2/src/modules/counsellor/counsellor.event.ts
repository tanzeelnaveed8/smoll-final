export const COUNSELLOR_SESSION_REQUEST_EVENT = 'counsellor.session.request';
export const COUNSELLOR_SESSION_ACCEPT_EVENT = 'counsellor.session.accept';

export class CounsellorSessionRequestEvent {
  constructor(
    public readonly memberName: string,
    public readonly sessionId: string,
  ) {}
}

export class CounsellorSessionAcceptEvent {
  constructor(
    public readonly memberId: string,
    public readonly counsellorName: string,
    public readonly sessionId: string,
  ) {}
}
