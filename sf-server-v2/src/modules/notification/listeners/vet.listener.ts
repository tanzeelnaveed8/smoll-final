import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationService } from '../notification.service';
import {
  MEMBER_CANCEL_CONSULTATION_EVENT,
  MemberCancelConsultationEvent,
  VET_ADDED_CASE_EVENT,
  VET_CALL_INITIATE_EVENT,
  VET_CALL_REJECT_EVENT,
  VET_CALL_REQUEST_EVENT,
  VET_CONSULTATION_SCHEDULED_EVENT,
  VET_FEEDBACK_CREATED_EVENT,
  VetCallInitiateEvent,
  VetCallRejectEvent,
  VetCallRequestEvent,
  VetConsultationScheduledEvent,
  VetFeedbackCreatedEvent,
} from 'src/modules/vet/vet.event';
import { RolesEnum } from 'src/guards/role/role.enum';

@Injectable()
export class VetListener {
  constructor(private readonly notificationService: NotificationService) {}

  @OnEvent(VET_CALL_REQUEST_EVENT)
  async handleVetCallRequestEvent(event: VetCallRequestEvent) {
    const { memberName, vetId } = event;

    await this.notificationService.create(vetId, RolesEnum.VET, {
      message: `${memberName} has initiated a consultation.`,
    });
  }

  @OnEvent(VET_ADDED_CASE_EVENT)
  async handleVetAddedCaseEvent(event: VetCallRequestEvent) {
    const { memberName, vetId } = event;

    await this.notificationService.create(vetId, RolesEnum.VET, {
      message: `${memberName} has added a case to your consultation.`,
    });
  }

  @OnEvent(VET_CALL_INITIATE_EVENT)
  async handleVetCallInitiateEvent(event: VetCallInitiateEvent) {
    const { memberId, vetName } = event;

    await this.notificationService.create(memberId, RolesEnum.MEMBER, {
      message: `${vetName} has initiated a consultation call.`,
    });
  }

  @OnEvent(VET_CALL_REJECT_EVENT)
  async handleVetCallRejectEvent(event: VetCallRejectEvent) {
    const { memberId, vetName } = event;

    await this.notificationService.create(memberId, RolesEnum.MEMBER, {
      message: `${vetName} has rejected your call request.`,
    });
  }

  @OnEvent(VET_FEEDBACK_CREATED_EVENT)
  async handleVetFeedbackCreatedEvent(event: VetFeedbackCreatedEvent) {
    const { memberName, vetId, ratings } = event;

    await this.notificationService.create(vetId, RolesEnum.VET, {
      message: `${memberName} rated you "${ratings}" for your consultation.`,
    });
  }

  @OnEvent(VET_CONSULTATION_SCHEDULED_EVENT)
  async handleVetConsultationScheduledEvent(
    event: VetConsultationScheduledEvent,
  ) {
    const { memberName, vetId } = event;

    await this.notificationService.create(vetId, RolesEnum.VET, {
      message: `${memberName} has scheduled a consultation.`,
    });
  }

  @OnEvent(MEMBER_CANCEL_CONSULTATION_EVENT)
  async handleVetMemberCancelConsultationEvent(
    event: MemberCancelConsultationEvent,
  ) {
    const { vetId, memberName } = event;

    await this.notificationService.create(vetId, RolesEnum.VET, {
      message: `${memberName} has cancelled the consultation.`,
    });
  }
}
