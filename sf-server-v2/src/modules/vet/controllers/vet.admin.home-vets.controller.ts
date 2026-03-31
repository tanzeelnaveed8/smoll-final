import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiCookieAuth, ApiExtraModels, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/decorators/role.decorator';
import { RoleGuard } from 'src/guards/role/role.guard';
import { RolesEnum } from 'src/guards/role/role.enum';
import { PaginationResult, getPaginationResponseSchema } from 'src/utils/pagination';
import { Vet } from '../entities/vet.entity';
import { VetService } from '../services/vet.service';
import { VetAdminService } from '../services/vet.admin.service';
import { CreateVetPayloadDto } from '../dtos/create.admin.dto';

@ApiTags('Home Vets: Admin Role')
@ApiCookieAuth()
@Controller('/admin/home-vets')
@UseGuards(AuthGuard(), RoleGuard)
@Roles([RolesEnum.ADMIN])
@ApiExtraModels(Vet)
export class VetAdminHomeVetsController {
  constructor(
    private readonly vetService: VetService,
    private readonly vetAdminService: VetAdminService,
  ) {}

  @ApiResponse({
    schema: getPaginationResponseSchema(Vet),
  })
  @Get()
  async findAll(
    @Query('isSuspended') isSuspended = 'false',
    @Query('search') search?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ): Promise<PaginationResult<Vet>> {
    return this.vetService.findHomeVets(
      isSuspended === 'true',
      search,
      Number(page),
      Number(limit),
    );
  }

  @Post()
  async create(@Body() body: CreateVetPayloadDto) {
    body.isHomeVet = true;
    return this.vetAdminService.create(body);
  }
}

