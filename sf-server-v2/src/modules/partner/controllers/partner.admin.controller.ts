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
import { CreatePartnerResDto } from '../dto/create.dto';
import { PartnerAdminService } from '../services/partner.admin.service';
import {
  FindAllPartnerAdminQueryDto,
  FindPartnerAdminResDto,
} from '../dto/find.admin.dto';
import { CreatePartnerPayloadDto } from '../dto/create.admin.dto';
import {
  getPaginationResponseSchema,
  PaginationResult,
} from 'src/utils/pagination';
import {
  UpdatePartnerPayloadDto,
  UpdatePartnerResDto,
} from '../dto/update.admin.dto';

@ApiTags('Partner: Admin Role')
@ApiCookieAuth()
@Controller('/admin/partners')
@UseGuards(AuthGuard(), RoleGuard)
@Roles([RolesEnum.ADMIN])
@ApiExtraModels(FindPartnerAdminResDto) // For complex response structure eg: `getPaginationResponseSchema`
export class PartnerAdminController {
  constructor(private readonly partnerService: PartnerAdminService) {}

  @ApiResponse({
    schema: getPaginationResponseSchema(FindPartnerAdminResDto),
  })
  @Get()
  async findAll(
    @Query() query: FindAllPartnerAdminQueryDto,
  ): Promise<PaginationResult<FindPartnerAdminResDto>> {
    const result = await this.partnerService.findAll(query);

    const data = plainToInstance(FindPartnerAdminResDto, result.data, {
      excludeExtraneousValues: true,
    });

    return {
      ...result,
      data,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<FindPartnerAdminResDto> {
    const partner = await this.partnerService.findOne(id);

    return plainToInstance(FindPartnerAdminResDto, partner, {
      excludeExtraneousValues: true,
    });
  }

  @Post()
  async create(
    @Body() body: CreatePartnerPayloadDto,
  ): Promise<CreatePartnerResDto> {
    const partner = await this.partnerService.create(body);

    return plainToInstance(CreatePartnerResDto, partner, {
      excludeExtraneousValues: true,
    });
  }

  @Post(':id/reset-password')
  async resetPassword(@Param('id') id: string): Promise<void> {
    await this.partnerService.resetPassword(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdatePartnerPayloadDto,
  ): Promise<UpdatePartnerResDto> {
    const partner = await this.partnerService.update(id, body);

    return plainToInstance(UpdatePartnerResDto, partner, {
      excludeExtraneousValues: true,
    });
  }

  @Post(':id/suspend')
  async suspend(@Param('id') id: string): Promise<void> {
    await this.partnerService.suspend(id);
  }

  @Post(':id/activate')
  async unsuspend(@Param('id') id: string): Promise<void> {
    await this.partnerService.activate(id);
  }
}
