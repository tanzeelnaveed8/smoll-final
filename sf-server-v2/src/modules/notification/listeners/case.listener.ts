import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationService } from '../notification.service';
import { RolesEnum } from 'src/guards/role/role.enum';
import {
  CASE_CLOSED_EVENT,
  CASE_EMERGENCY_ESCALATION_EVENT,
  CASE_ESCALATED_EVENT,
  CaseClosedEvent,
  CaseEmergencyEscalationEvent,
  CaseEscalatedEvent,
} from 'src/modules/case/case.event';

@Injectable()
export class CaseListener {
  constructor(private readonly notificationService: NotificationService) {}

  @OnEvent(CASE_CLOSED_EVENT)
  async handleCaseClosedEvent(event: CaseClosedEvent) {
    const { vetName, memberId, petName } = event;

    await this.notificationService.create(memberId, RolesEnum.MEMBER, {
      message: `${vetName} has confirmed the case for ${petName}.`,
    });
  }

  @OnEvent(CASE_ESCALATED_EVENT)
  async handleCaseEscalatedEvent(event: CaseEscalatedEvent) {
    const { partnerIds, vetName, memberId, petName } = event;

    await this.notificationService.create(memberId, RolesEnum.MEMBER, {
      message: `${vetName} has escalated the case for your pet.`,
    });

    partnerIds.forEach(async (partnerId) => {
      await this.notificationService.create(partnerId, RolesEnum.PARTNER, {
        message: `${vetName} has escalated the case for ${petName}.`,
      });
    });
  }

  @OnEvent(CASE_EMERGENCY_ESCALATION_EVENT)
  async handleCaseEmergencyEscalationEvent(
    event: CaseEmergencyEscalationEvent,
  ) {
    const { partnerId, petName, partnerName, isEmergency } = event;

    await this.notificationService.create(partnerId, RolesEnum.MEMBER, {
      message: `Your ${isEmergency ? 'emergency' : ''} case for ${petName} has been escalated to our partner ${partnerName} 👨‍⚕️👩‍⚕️`,
    });
  }
}
