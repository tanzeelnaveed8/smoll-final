import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { Roles } from 'src/decorators/role.decorator';
import { RoleGuard } from 'src/guards/role/role.guard';
import { RolesEnum } from '../../../guards/role/role.enum';
import {
  FindAllVetResDto,
  FindAvailabilitiesResDto,
  FindOneConsultationResDto,
  FindOneVetResDto,
  FindVetAvailabilityQueryDto,
} from '../dtos/find.dto';
import { AuthUser, GetUser } from 'src/decorators/get-user.decorator';
import { UpdateConsultationPayloadDto } from '../dtos/update.dto';
import { VetMemberService } from '../services/vet.member.service';
import { SocketService } from 'src/modules/socket/socket.service';
import { SocketEventEnum } from 'src/modules/socket/socket-event.enum';
import {
  CreateFeedbackPayloadDto,
  CreateFeedbackQueryDto,
  CreateFeedbackResDto,
  CreateRequestConsultaionPayloadDto,
  ScheduleConsultationPayloadDto,
} from '../dtos/create.dto';
import { VetFeedbackService } from '../services/vet.feedback.service';
import { VetConsultation } from '../entities/vet.consultation.entity';

@ApiTags('Vet: Member Role')
@ApiCookieAuth()
@Controller('/member/vets')
@UseGuards(AuthGuard(), RoleGuard)
@Roles([RolesEnum.MEMBER])
export class VetMemberController {
  constructor(
    private readonly vetService: VetMemberService,
    private readonly socketService: SocketService,
    private readonly feedbackService: VetFeedbackService,
  ) {}

  @Get()
  async findAll(): Promise<FindAllVetResDto[]> {
    const vets = await this.vetService.findAll();

    return plainToInstance(FindAllVetResDto, vets, {
      excludeExtraneousValues: true,
    });
  }

  @Get('/findByFilter')
  async findAll2(
    @Query('specialityId') specialityId?: string,
    @Query('online') online?: string,
  ): Promise<FindAllVetResDto[]> {
    const vets = await this.vetService.findAll2({ specialityId, online });

    return plainToInstance(FindAllVetResDto, vets, {
      excludeExtraneousValues: true,
    });
  }

  @Get('/:id')
  async findOne(@Param('id') id: string): Promise<FindOneVetResDto> {
    const vet = await this.vetService.findOne(id);

    return plainToInstance(FindOneVetResDto, vet, {
      excludeExtraneousValues: true,
    });
  }

  @Get('/:id/availabilities')
  async findAvailabilities(
    @Param('id') id: string,
    @Query() query: FindVetAvailabilityQueryDto,
  ): Promise<FindAvailabilitiesResDto[]> {
    const availabilities = await this.vetService.findAvailabilities(id, query);

    return plainToInstance(FindAvailabilitiesResDto, availabilities, {
      excludeExtraneousValues: true,
    });
  }

  @Get('/consultations/:id')
  async findConsultations(
    @GetUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<FindOneConsultationResDto> {
    const consultations = await this.vetService.findOneConsultation(user, id, {
      case: {
        pet: true,
      },
      vet: true,
    });

    return plainToInstance(FindOneConsultationResDto, consultations, {
      excludeExtraneousValues: true,
    });
  }

  @Post('/:id/feedbacks')
  async feedback(
    @Param('id') id: string,
    @GetUser() user: AuthUser,
    @Query() query: CreateFeedbackQueryDto,
    @Body() body: CreateFeedbackPayloadDto,
  ): Promise<CreateFeedbackResDto> {
    const feedback = await this.feedbackService.feedback(user, id, body, query);

    return plainToInstance(CreateFeedbackResDto, feedback, {
      excludeExtraneousValues: true,
    });
  }

  @Post('/:id/consultations/request')
  // @UseGuards(SubscriptionGuard)
  async requestCall(
    @Param('id') id: string,
    @Body() body: CreateRequestConsultaionPayloadDto,
    @GetUser() user: AuthUser,
  ): Promise<{ id: string }> {
    const { petId } = body;
    const consultation = await this.vetService.requestConsultation(
      user,
      id,
      petId,
    );

    this.socketService.emit(SocketEventEnum.VET_REQUEST_CONSULTATION, {
      by: user.name,
    });

    return { id: consultation.id };
  }

  @Post('/:id/consultations/schedule')
  async scheduleConsultation(
    @Param('id') id: string,
    @GetUser() user: AuthUser,
    @Body() body: ScheduleConsultationPayloadDto,
  ): Promise<VetConsultation> {
    return await this.vetService.scheduleConsultation(user, id, body);
  }

  @Patch('/consultations/:id')
  async updateConsultationCase(
    @GetUser() user: AuthUser,
    @Param('id') consultationId: string,
    @Body() body: UpdateConsultationPayloadDto,
  ): Promise<void> {
    await this.vetService.updateConsultationCase(user, consultationId, body);

    this.socketService.emit(SocketEventEnum.VET_CONSULTATION_CASE_UPDATED, {
      consultationId,
    });
  }

  @Delete('/consultations/:id')
  async cancelConsultation(
    @Param('id') id: string,
    @GetUser() user: AuthUser,
  ): Promise<void> {
    await this.vetService.cancelConsultation(user, id);

    this.socketService.emit(SocketEventEnum.MEMBER_CANCEL_CONSULTATION, {
      consultationId: id,
    });
  }
}
