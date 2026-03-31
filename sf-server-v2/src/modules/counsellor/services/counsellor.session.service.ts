import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthUser } from 'src/decorators/get-user.decorator';
import { FindOptionsRelations, Repository } from 'typeorm';
import {
  COUNSELLOR_SESSION_ACCEPT_EVENT,
  COUNSELLOR_SESSION_REQUEST_EVENT,
  CounsellorSessionAcceptEvent,
  CounsellorSessionRequestEvent,
} from '../counsellor.event';
import { CounsellorSession } from '../entities/counsellor.session.entity';
import { CounsellorSessionStatus } from '../session-status.enum';
import {
  FindAllCounsellorSessionQueryDto,
  FindAllSessionsQueryDto,
} from '../dtos/find.dto';
import { SocketService } from 'src/modules/socket/socket.service';
import { SocketEventEnum } from 'src/modules/socket/socket-event.enum';

@Injectable()
export class CounsellorSessionService {
  constructor(
    @InjectRepository(CounsellorSession)
    private readonly counsellorSessionRepo: Repository<CounsellorSession>,
    private readonly eventEmitter: EventEmitter2,
    private readonly socketService: SocketService,
  ) {}

  async findOne(
    id: string,
    entitiesToLoad?: FindOptionsRelations<CounsellorSession>,
  ): Promise<CounsellorSession> {
    const session = await this.counsellorSessionRepo.findOne({
      where: { id },
      relations: entitiesToLoad,
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    return session;
  }

  async findAll(
    member: AuthUser,
    query: FindAllSessionsQueryDto,
  ): Promise<CounsellorSession[]> {
    const { status } = query;
    const sessions = await this.counsellorSessionRepo.find({
      where: { member: { id: member.id }, status },
      relations: ['counsellor'],
    });

    return sessions;
  }

  async findAllCounsellorSessions(
    counsellor: AuthUser,
    query: FindAllCounsellorSessionQueryDto,
  ): Promise<CounsellorSession[]> {
    const { status } = query;

    const sessions = await this.counsellorSessionRepo.find({
      where: {
        status,
        counsellor:
          status === CounsellorSessionStatus.ACCEPTED
            ? { id: counsellor.id }
            : undefined,
      },
      relations: ['member'],
    });

    return sessions;
  }

  async requestSession(member: AuthUser): Promise<void> {
    // Check if any pending session is present,
    let session = await this.counsellorSessionRepo.findOne({
      where: {
        member: { id: member.id },
        status: CounsellorSessionStatus.PENDING,
      },
    });

    // if present, skip creation but notify counsellors
    if (!session) {
      // Session creation
      const counsellorSession = this.counsellorSessionRepo.create({
        member: <any>{ id: member.id },
      });

      session = await this.counsellorSessionRepo.save(counsellorSession);
    }

    // Notifying counsellors
    this.eventEmitter.emit(
      COUNSELLOR_SESSION_REQUEST_EVENT,
      new CounsellorSessionRequestEvent(member.name, session.id),
    );
  }

  async acceptSession(counsellor: AuthUser, sessionId: string): Promise<void> {
    const session = await this.findOne(sessionId, {
      member: true,
    });

    if (session.status !== CounsellorSessionStatus.PENDING) {
      throw new BadRequestException('Session is already accepted');
    }

    const memberId = session.member.id;

    this.counsellorSessionRepo.update(sessionId, {
      counsellor: <any>{ id: counsellor.id },
      status: CounsellorSessionStatus.ACCEPTED,
    });

    this.eventEmitter.emit(
      COUNSELLOR_SESSION_ACCEPT_EVENT,
      new CounsellorSessionAcceptEvent(memberId, counsellor.name, sessionId),
    );

    this.socketService.emit(SocketEventEnum.SESSION_ACCEPTED, {
      counsellorId: counsellor.id,
      counsellorName: counsellor.name,
    });
  }
}
