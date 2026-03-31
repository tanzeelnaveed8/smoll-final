import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiCookieAuth, ApiExtraModels, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { Roles } from 'src/decorators/role.decorator';
import { RoleGuard } from 'src/guards/role/role.guard';
import { RolesEnum } from 'src/guards/role/role.enum';
import {
  FindConsultationsForVetQueryDto,
  FindConsultationsForVetResDto,
} from '../dtos/find.dto';
import { AdminCreateConsultationPayloadDto } from '../dtos/create.dto';
import { VetService } from '../services/vet.service';
import { PaginationResult, getPaginationResponseSchema } from 'src/utils/pagination';

@ApiTags('Vet Consultations: Admin Role')
@ApiCookieAuth()
@Controller('/admin/vet-consultations')
@UseGuards(AuthGuard(), RoleGuard)
@Roles([RolesEnum.ADMIN])
@ApiExtraModels(FindConsultationsForVetResDto)
export class VetAdminConsultationsController {
  constructor(private readonly vetService: VetService) {}

  @Post()
  async create(
    @Body() body: AdminCreateConsultationPayloadDto,
  ) {
    return this.vetService.adminCreateConsultation(body);
  }

  @Get()
  async findAllForAdmin(
    @Query() query: FindConsultationsForVetQueryDto,
  ) {
    // Admin can see all vets' consultations, so we don't filter by vet id here.
    // Return raw data so the frontend gets full member/pet/vet/case objects.
    return this.vetService.findConsultationsForAdmin(query);
  }

  @Get(':id')
  async findOneForAdmin(
    @Param('id') id: string,
  ): Promise<FindConsultationsForVetResDto> {
    const consultation = await this.vetService.adminFindOneConsultation(id);
    return plainToInstance(FindConsultationsForVetResDto, consultation, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id/assign-vet')
  async assignVet(
    @Param('id') id: string,
    @Body() body: { vetId: string },
  ): Promise<void> {
    await this.vetService.adminAssignVetToConsultation(id, body.vetId);
  }

  @Patch(':id/notes')
  async updateNotes(
    @Param('id') id: string,
    @Body() body: { note: string },
  ): Promise<void> {
    await this.vetService.adminUpdateConsultationNote(id, body.note);
  }

  @Post(':id/cancel')
  async cancel(@Param('id') id: string): Promise<void> {
    await this.vetService.adminCancelConsultation(id);
  }

  @Post(':id/confirm')
  async confirm(@Param('id') id: string): Promise<void> {
    await this.vetService.adminConfirmConsultation(id);
  }
}

