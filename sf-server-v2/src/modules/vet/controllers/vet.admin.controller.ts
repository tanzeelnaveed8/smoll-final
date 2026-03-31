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
import {
  ApiCookieAuth,
  ApiExtraModels,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { Roles } from 'src/decorators/role.decorator';
import { RoleGuard } from 'src/guards/role/role.guard';
import { RolesEnum } from '../../../guards/role/role.enum';
import { VetAdminService } from '../services/vet.admin.service';
import {
  FindAllVetAdminResDto,
  FindAllVetQueryDto,
  FindOneVetAdminResDto,
} from '../dtos/find.admin.dto';
import {
  getPaginationResponseSchema,
  PaginationResult,
} from 'src/utils/pagination';
import { CreateVetPayloadDto, CreateVetResDto } from '../dtos/create.admin.dto';
import { UpdateVetPayloadDto, UpdateVetResDto } from '../dtos/update.admin.dto';

@ApiTags('Vet: Admin Role')
@ApiCookieAuth()
@Controller('/admin/vets')
@UseGuards(AuthGuard(), RoleGuard)
@Roles([RolesEnum.ADMIN])
@ApiExtraModels(FindAllVetAdminResDto) // For complex response structure eg: `getPaginationResponseSchema`
export class VetAdminController {
  constructor(private readonly vetService: VetAdminService) { }

  @Post()
  async create(@Body() body: CreateVetPayloadDto): Promise<CreateVetResDto> {
    const vet = await this.vetService.create(body);

    return plainToInstance(CreateVetResDto, vet, {
      excludeExtraneousValues: true,
    });
  }

  @Post(':id/suspend')
  async suspend(@Param('id') id: string): Promise<void> {
    await this.vetService.suspend(id);
  }

  @Post(':id/activate')
  async unsuspend(@Param('id') id: string): Promise<void> {
    await this.vetService.activate(id);
  }

  @ApiResponse({
    schema: getPaginationResponseSchema(FindAllVetAdminResDto),
  })
  @Get()
  async findAll(
    @Query() query: FindAllVetQueryDto,
  ): Promise<PaginationResult<FindAllVetAdminResDto>> {
    const res = await this.vetService.findAll(query);

    const data = plainToInstance(FindAllVetAdminResDto, res.data, {
      excludeExtraneousValues: true,
    });

    return {
      ...res,
      data,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<FindOneVetAdminResDto> {
    const vet = await this.vetService.findOne(id);

    return plainToInstance(FindOneVetAdminResDto, vet, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateVetPayloadDto,
  ): Promise<UpdateVetResDto> {
    const vet = await this.vetService.update(id, body);

    return plainToInstance(UpdateVetResDto, vet, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':id/cases')
  async findVetCases(@Param('id') id: string) {
    return this.vetService.findVetCases(id);
  }

  @Post(':id/reset-password')
  async resetPassword(@Param('id') id: string) {
    return this.vetService.resetPassword(id);
  }
}
