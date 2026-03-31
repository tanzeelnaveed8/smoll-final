import {
  Body,
  Controller,
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
import { AuthUser, GetUser } from 'src/decorators/get-user.decorator';
import { Roles } from 'src/decorators/role.decorator';
import { RoleGuard } from 'src/guards/role/role.guard';
import { RolesEnum } from '../../../guards/role/role.enum';
import {
  FindAvailabilitiesResDto,
  FindConsultationsForVetQueryDto,
  FindConsultationsForVetResDto,
  FindOneConsultationForVetResDto,
  FindOneVetResDto,
  FindVetAvailabilityQueryDto,
  FindConsultationCalendarResDto,
  FindConsultationCalendarQueryDto,
  FindMemberForVetResDto,
} from '../dtos/find.dto';
import { VetService } from '../services/vet.service';
import { CreateAvailabilityDto } from '../dtos/create.dto';
import { UpdateVetPayloadDto, UpdateVetResDto } from '../dtos/update.dto';
import { PaginationResult } from 'src/utils/pagination';
import { SocketService } from 'src/modules/socket/socket.service';
import { SocketEventEnum } from 'src/modules/socket/socket-event.enum';
import { CreateCasePayloadDto, CreateCaseQueryDto } from 'src/modules/case/dto/create.dto';
import { CreatePetPayloadDto } from 'src/modules/pet/dto/create.dto';
import { Pet } from 'src/modules/pet/entities/pet.entity';

@ApiTags('Vet: Vet Role')
@ApiCookieAuth()
@Controller('/vets')
@UseGuards(AuthGuard(), RoleGuard)
@Roles([RolesEnum.VET])
export class VetController {
  constructor(
    private readonly vetService: VetService,
    private readonly socketService: SocketService,
  ) {}

  @Get('/me')
  async findMe(@GetUser() user: AuthUser): Promise<FindOneVetResDto> {
    const vet = await this.vetService.findOne(user.id);

    return plainToInstance(FindOneVetResDto, vet, {
      excludeExtraneousValues: true,
    });
  }

  @Get('/me/availabilities')
  async findAvailabilities(
    @GetUser('id') id: string,
    @Query() query: FindVetAvailabilityQueryDto,
  ): Promise<FindAvailabilitiesResDto[]> {
    const availabilities = await this.vetService.findAvailabilities(id, query);

    return plainToInstance(FindAvailabilitiesResDto, availabilities, {
      excludeExtraneousValues: true,
    });
  }

  @Patch('/me')
  async update(
    @GetUser('id') id: string,
    @Body() body: UpdateVetPayloadDto,
  ): Promise<UpdateVetResDto> {
    const vet = await this.vetService.update(id, body);

    return plainToInstance(UpdateVetResDto, vet, {
      excludeExtraneousValues: true,
    });
  }

  @Post('/me/availabilities')
  async createAvailability(
    @GetUser('id') id: string,
    @Body() body: CreateAvailabilityDto,
  ): Promise<FindAvailabilitiesResDto[]> {
    const availabilities = await this.vetService.createAvailability(id, body);

    return plainToInstance(FindAvailabilitiesResDto, availabilities, {
      excludeExtraneousValues: true,
    });
  }

  @Get('/members/:id')
  async findOneMember(
    @Param('id') id: string,
    @GetUser() User: AuthUser,
  ): Promise<FindMemberForVetResDto>{
      const res = await this.vetService.findOneMember(id)
      return res;
  }

  @Post('/members/:id/cases')
  async createCase(
    @GetUser() user: AuthUser,
    @Param('id') memberId: string,
    @Query() query: CreateCaseQueryDto,
    @Body() body: CreateCasePayloadDto,
  ) {
      const res = this.vetService.createCase(memberId, query, body)
      return res;
  }

  @Post('/members/:id/pets')
  async createPet(
    @GetUser() user: AuthUser,
    @Param('id') memberId: string,
    @Body() body: CreatePetPayloadDto
  ):Promise<Pet> {
    const pet = this.vetService.createPet(memberId, body)
    return pet;
  }

  @Get('/consultations')
  async findConsultations(
    @GetUser() user: AuthUser,
    @Query() query: FindConsultationsForVetQueryDto,
  ): Promise<PaginationResult<FindConsultationsForVetResDto>> {
    const res = await this.vetService.findConsultations(user, query);

    const consultations = plainToInstance(
      FindConsultationsForVetResDto,
      res.data,
      {
        excludeExtraneousValues: true,
      },
    );

    return {
      ...res,
      data: consultations,
    };
  }

  @Get('/consultations/calendar')
  async findWeeklyConsultations(
    @GetUser() user: AuthUser,
    @Query() query: FindConsultationCalendarQueryDto,
  ): Promise<FindConsultationCalendarResDto> {
    return this.vetService.findConsultationCalendar(user, query);
  }

  @Get('/consultations/:id')
  async findOneConsultation(
    @Param('id') id: string,
    @GetUser() user: AuthUser,
  ): Promise<FindOneConsultationForVetResDto> {
    const consultation = await this.vetService.findOneConsultations(user, id);

    const result = plainToInstance(FindOneConsultationForVetResDto, consultation, {
      excludeExtraneousValues: true,
    });
    if (result.case) {
      result.case.serviceChecklist = consultation.case?.serviceChecklist ?? [];
      result.case.customerNotReachable = consultation.case?.customerNotReachable ?? false;
    }
    return result;
  }

  @Post('/consultations/:id/initiate-call')
  async initiateCall(
    @Param('id') id: string,
    @GetUser() user: AuthUser,
  ): Promise<void> {
    return this.vetService.initiateCall(user, id);
  }

  @Post('/consultations/:id/initiate-call/:callId')
  async initiateCallWithCallId(
    @Param('id') id: string,
    @Param('callId') callId: string,
    @Body() body: { memberId: string },
    @GetUser() user: AuthUser,
  ): Promise<void> {
    return this.vetService.initiateWithCallId(user, body.memberId, callId);
  }

  @Post('/consultations/:id/end-call')
  async endCall(
    @Param('id') id: string,
    @GetUser() user: AuthUser,
  ): Promise<void> {
    const consultation = await this.vetService.closeConsultation(user, id);

    this.socketService.emit(SocketEventEnum.VET_END_CONSULTATION, {
      consultationId: consultation.id,
      vetId: user.id,
    });
  }

  @Post('/consultations/:id/send-reminder')
  async sendReminder(
    @Param('id') id: string,
    @GetUser() user: AuthUser,
  ): Promise<void> {
    return this.vetService.sendReminder(user, id);
  }

  @Post('/consultations/:id/accept')
  async acceptConsultation(
    @Param('id') id: string,
    @GetUser() user: AuthUser,
  ): Promise<{ message: string }> {
    await this.vetService.acceptConsultation(user, id);
    return { message: 'Consultation accepted' };
  }

  @Post('/consultations/:id/reject')
  async rejectConsultation(
    @Param('id') id: string,
    @GetUser() user: AuthUser,
  ): Promise<{ message: string }> {
    await this.vetService.rejectConsultation(user, id);
    return { message: 'Consultation rejected' };
  }

  @Get('/finance')
  async getFinanceStats(@GetUser() user: AuthUser) {
    return this.vetService.findFinanceStats(user.id);
  }
}
