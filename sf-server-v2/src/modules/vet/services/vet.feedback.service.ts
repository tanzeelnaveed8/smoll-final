import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VetService } from './vet.service';
import { VetFeedback } from '../entities/vet.feedback.entity';
import { AuthUser } from 'src/decorators/get-user.decorator';
import {
  CreateFeedbackPayloadDto,
  CreateFeedbackQueryDto,
} from '../dtos/create.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  VET_FEEDBACK_CREATED_EVENT,
  VetFeedbackCreatedEvent,
} from '../vet.event';

@Injectable()
export class VetFeedbackService {
  constructor(
    @InjectRepository(VetFeedback)
    private readonly feedbackRepo: Repository<VetFeedback>,
    private readonly vetService: VetService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private async _findFeedbackByCaseId(caseId: string): Promise<VetFeedback> {
    const feedback = await this.feedbackRepo.findOne({
      where: { case: { id: caseId } },
    });

    return feedback;
  }

  async findAllFeedback(vet: AuthUser): Promise<VetFeedback[]> {
    const feedback = await this.feedbackRepo.find({
      where: { vet: { id: vet.id } },
      relations: ['member', 'case'],
    });

    return feedback;
  }

  async feedback(
    member: AuthUser,
    id: string,
    body: CreateFeedbackPayloadDto,
    query: CreateFeedbackQueryDto,
  ): Promise<VetFeedback> {
    const { rating, comment } = body;
    const { caseId } = query;

    await this.vetService.findOne(id);
    const foundCaseFeedback = await this._findFeedbackByCaseId(caseId);

    if (foundCaseFeedback) {
      throw new BadRequestException('Feedback already exists');
    }

    const _feedback = this.feedbackRepo.create({
      rating,
      comment,
      member: <any>{ id: member.id },
      vet: <any>{ id },
      case: <any>{ id: caseId },
    });

    const feedback = await this.feedbackRepo.save(_feedback);

    this.eventEmitter.emit(
      VET_FEEDBACK_CREATED_EVENT,
      new VetFeedbackCreatedEvent(id, member.name, rating),
    );

    return feedback;
  }
}
