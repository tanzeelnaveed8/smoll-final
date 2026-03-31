import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiCookieAuth,
  ApiExtraModels,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { Roles } from 'src/decorators/role.decorator';
import { RoleGuard } from 'src/guards/role/role.guard';
import {
  getPaginationResponseSchema,
  PaginationResult,
} from 'src/utils/pagination';
import { RolesEnum } from '../../../guards/role/role.enum';
import {
  FindAllPartnersForVetQueryDto,
  FindAllPartnersForVetResDto,
  FindAllServicesForVetQueryDto,
} from '../dto/find.vet.dto';
import { PartnerVetService } from '../services/partner.vet.service';
import { PartnerService } from '../services/partner.service';
import { FindPartnerServiceResDto } from '../dto/find.dto';
import { FindVetAvailabilityQueryDto } from 'src/modules/vet/dtos/find.dto';
import { FindAvailabilitiesResDto } from 'src/modules/vet/dtos/find.dto';
import { PartnerMemberService } from '../services/partner.member.service';

@ApiTags('Partner: Vet Role')
@ApiCookieAuth()
@Controller('/vet/partners')
@UseGuards(AuthGuard(), RoleGuard)
@Roles([RolesEnum.VET])
@ApiExtraModels(FindAllPartnersForVetResDto) // For complex response structure eg: `getPaginationResponseSchema`
export class PartnerVetController {
  constructor(
    private readonly partnerVetService: PartnerVetService,
    private readonly partnerService: PartnerService,
    private readonly partnerMemberService: PartnerMemberService,
  ) {}

  @ApiResponse({
    schema: getPaginationResponseSchema(FindAllPartnersForVetResDto),
  })
  @Get('/')
  async findAll(
    @Query() query: FindAllPartnersForVetQueryDto,
  ): Promise<PaginationResult<FindAllPartnersForVetResDto>> {
    const res = await this.partnerVetService.findAll(query);

    const partners = plainToInstance(FindAllPartnersForVetResDto, res.data, {
      excludeExtraneousValues: true,
    });

    return {
      ...res,
      data: partners,
    };
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

  @Get(':id/services')
  async findAllServices(
    @Param('id') id: string,
    @Query() query: FindAllServicesForVetQueryDto,
  ): Promise<FindPartnerServiceResDto[]> {
    const services = await this.partnerVetService.findAllServices(id, query);

    return plainToInstance(FindPartnerServiceResDto, services, {
      excludeExtraneousValues: true,
    });
  }

  @Get('/specialities')
  async findAllSpecialities() {
    return await this.partnerService.findAllSpecialities();
  }
}
