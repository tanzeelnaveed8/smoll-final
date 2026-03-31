import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiCookieAuth, ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { Roles } from 'src/decorators/role.decorator';
import { RoleGuard } from 'src/guards/role/role.guard';
import { RolesEnum } from '../../../guards/role/role.enum';
import { PartnerMemberService } from '../services/partner.member.service';
import {
  FindAllAppointmentsForMemberDto,
  FindAllPartnerVetsForMemberDto,
  FindOneAppointmentForMemberDto,
  FindOnePartnerForMemberDto,
  FindOnePartnerVetForMemberDto,
  FindPartnerForMemberResDto,
} from '../dto/find.member.dto';
import {
  FindAvailabilitiesResDto,
  FindVetAvailabilityQueryDto,
} from 'src/modules/vet/dtos/find.dto';
import { AuthUser, GetUser } from 'src/decorators/get-user.decorator';
import {
  BookAppointmentPayloadDto,
  BookEmergencyAppointmentPayloadDto,
} from '../dto/create.dto';
import { PartnerService } from '../services/partner.service';
import { FindPartnerPayloadDto } from '../dto/find.dto';

@ApiTags('Partner: Member Role')
@ApiCookieAuth()
@Controller('/member/partners')
@UseGuards(AuthGuard(), RoleGuard)
@Roles([RolesEnum.MEMBER])
@ApiExtraModels(FindAllAppointmentsForMemberDto)
export class PartnerMemberController {
  constructor(
    private readonly partnerMemberService: PartnerMemberService,
    private readonly partnerService: PartnerService,
  ) { }

  @Get()
  async findAllPartners(@Query() query: FindPartnerPayloadDto)//: Promise<FindPartnerForMemberResDto[]> 
  {
    const partner = await this.partnerMemberService.findAllPartner(query)
    return plainToInstance(FindPartnerForMemberResDto, partner, {
      excludeExtraneousValues: true
    });

  }

  @Get('/:id')
  async findOne(@Param('id') id: string): Promise<FindOnePartnerForMemberDto> {
    const partner = await this.partnerService.findOne(id);

    return plainToInstance(FindOnePartnerForMemberDto, partner, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':partnerId/vets')
  async findAllVets(
    @Param('partnerId') partnerId: string,
  ): Promise<FindAllPartnerVetsForMemberDto[]> {
    const vets = await this.partnerMemberService.findAllVet(partnerId);

    return plainToInstance(FindAllPartnerVetsForMemberDto, vets, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':partnerId/vets/:id')
  async findOneVet(
    @Param('partnerId') partnerId: string,
    @Param('id') id: string,
  ): Promise<FindOnePartnerVetForMemberDto> {
    const vet = await this.partnerMemberService.findOneVet(id, partnerId);

    return plainToInstance(FindOnePartnerVetForMemberDto, vet, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':partnerId/vets/:id/availabilities')
  async findAvailabilities(
    @Param('partnerId') partnerId: string,
    @Param('id') id: string,
    @Query() query: FindVetAvailabilityQueryDto,
  ): Promise<FindAvailabilitiesResDto[]> {
    const availabilities = await this.partnerMemberService.findAvailabilities(
      id,
      partnerId,
      query,
    );

    return plainToInstance(FindAvailabilitiesResDto, availabilities, {
      excludeExtraneousValues: true,
    });
  }

  @Get('/appointments/:id')
  async findOneAppointment(
    @GetUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<FindOneAppointmentForMemberDto> {
    const appointment = await this.partnerMemberService.findOneAppointment(
      user,
      id,
      {
        partner: true,
        case: { pet: true },
        vet: true,
      },
    );

    return plainToInstance(FindOneAppointmentForMemberDto, appointment, {
      excludeExtraneousValues: true,
    });
  }

  @Post(':partnerId/vets/:id/book')
  async createBooking(
    @GetUser() user: AuthUser,
    @Param('partnerId') partnerId: string,
    @Param('id') id: string,
    @Body() body: BookAppointmentPayloadDto,
  ) {
    return await this.partnerMemberService.bookAppointment(
      user,
      partnerId,
      id,
      body,
    );
  }

  @Post('/:id/emergency-book')
  async bookEmergencyAppointment(
    @GetUser() user: AuthUser,
    @Param('id') id: string,
    @Body() body: BookEmergencyAppointmentPayloadDto,
  ) {
    return await this.partnerMemberService.bookEmergencyAppointment(
      user,
      id,
      body,
    );
  }

  @Post('/appointments/:id/reschedule')
  async rescheduleAppointment(
    @Param('id') id: string,
    @GetUser() user: AuthUser,
  ) {
    await this.partnerMemberService.rescheduleAppointment(user, id);
  }

  @Delete('/appointments/:id')
  async cancelAppointment(
    @Param('id') id: string,
    @GetUser() user: AuthUser,
  ): Promise<void> {
    await this.partnerMemberService.cancelAppointment(user, id);
  }
}
