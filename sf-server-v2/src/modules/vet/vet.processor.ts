import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { VetConsultation } from './entities/vet.consultation.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationService } from '../notification/notification.service';
import { ConsultationStatusEnum } from './enums/consultation-status.enum';
import { CaseStatusEnum } from '../case/enums/case-status.enum';

export enum VetJobNameEnum {
  CONSULTATION_NOTIFICATION = 'consultation-notification',
  CONSULTATION_EXPIRED = 'consultation-expired',
}

@Injectable()
@Processor('vet')
export class VetProcessor extends WorkerHost {
  constructor(
    @InjectRepository(VetConsultation)
    private readonly vetConsultationRepo: Repository<VetConsultation>,
    private readonly notificationService: NotificationService,
  ) {
    super();
  }

  async process(job: Job<any, any, VetJobNameEnum>): Promise<void> {
    switch (job.name) {
      case VetJobNameEnum.CONSULTATION_NOTIFICATION:
        await this.handleConsultationNotification(job);
        break;
      case VetJobNameEnum.CONSULTATION_EXPIRED:
        await this.handleScheduledConsultationExpire(job);
        break;
    }
  }

  private async handleScheduledConsultationExpire(job) {
    const consultation = await this.vetConsultationRepo.findOne({
      where: { id: job.data.consultationId },
      relations: {
        member: true,
        case: true,
      },
    });

    if (
      consultation.status !== ConsultationStatusEnum.COMPLETED &&
      consultation.case.status !== CaseStatusEnum.CONFIRMED
    ) {
      consultation.status = ConsultationStatusEnum.COMPLETED;
      consultation.case.status = CaseStatusEnum.CONFIRMED;

      await this.vetConsultationRepo.save(consultation);
    }
  }

  private async handleConsultationNotification(job) {
    const consultation = await this.vetConsultationRepo.findOne({
      where: { id: job.data.consultationId },
      relations: {
        member: true,
        vet: true,
        case: {
          pet: true,
        },
      },
      select: {
        id: true,
        scheduledAt: true,
        status: true,
        member: {
          id: true,
          playerId: true,
        },
        vet: {
          id: true,
          profileImg: {
            url: true,
          },
        },
        case: {
          id: true,
          pet: {
            name: true,
          },
        },
      },
    });

    if (
      consultation &&
      consultation.scheduledAt &&
      consultation.status === ConsultationStatusEnum.SCHEDULED
    ) {
      if (consultation.member.playerId) {
        await this.vetConsultationRepo.update(consultation.id, {
          status: ConsultationStatusEnum.INITIATED,
        });

        // Send notification using your notification service
        await this.notificationService.sendOneSignalNotification({
          playerId: consultation.member.playerId,
          heading: '🐾 Expert consultation',
          message: `🚨 Your expert consultation is starting in a minute! 🕐`,
          icon: consultation.vet.profileImg.url,
          meta: {
            consultationId: consultation.id,
            caseId: consultation.case.id,
            vetId: consultation.vet.id,
            petName: consultation.case.pet.name,
            notificationType: VetJobNameEnum.CONSULTATION_NOTIFICATION,
          },
        });
      }
    }
  }
}
