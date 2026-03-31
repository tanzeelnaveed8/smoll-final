import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationService } from '../notification.service';
import { CounsellorService } from 'src/modules/counsellor/services/counsellor.service';
import {
  COUNSELLOR_SESSION_ACCEPT_EVENT,
  COUNSELLOR_SESSION_REQUEST_EVENT,
  CounsellorSessionAcceptEvent,
  CounsellorSessionRequestEvent,
} from 'src/modules/counsellor/counsellor.event';
import { RolesEnum } from 'src/guards/role/role.enum';

@Injectable()
export class CounsellorListener {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly counsellorService: CounsellorService,
  ) {}

  private lastNotificationTime: Map<string, number> = new Map();

  @OnEvent(COUNSELLOR_SESSION_REQUEST_EVENT)
  async handleSessionCreatedEvent(event: CounsellorSessionRequestEvent) {
    const { memberName, sessionId } = event;

    const counsellors = await this.counsellorService.findAll();

    const currentTime = Date.now();
    const lastTime = this.lastNotificationTime.get(sessionId) || 0;

    if (currentTime - lastTime < 1 * 60 * 1000) {
      return;
    }

    this.lastNotificationTime.set(sessionId, Date.now());

    counsellors.forEach(async (counsellor) => {
      await this.notificationService.create(
        counsellor.id,
        RolesEnum.COUNSELLOR,
        {
          message: `${memberName} has requested a new session.`,
          meta: {
            sessionId,
          },
        },
      );
    });
  }

  @OnEvent(COUNSELLOR_SESSION_ACCEPT_EVENT)
  async handleSessionAcceptedEvent(event: CounsellorSessionAcceptEvent) {
    const { memberId, counsellorName, sessionId } = event;

    await this.notificationService.create(memberId, RolesEnum.MEMBER, {
      message: `Your session has been accepted by ${counsellorName}.`,
      meta: {
        sessionId,
      },
    });
  }
}
