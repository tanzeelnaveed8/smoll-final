import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { Roles } from 'src/decorators/role.decorator';
import { RoleGuard } from 'src/guards/role/role.guard';
import { RolesEnum } from '../../../guards/role/role.enum';
import { CounsellorService } from '../services/counsellor.service';
import {
  CreateCounsellorPayloadDto,
  CreateCounsellorResDto,
} from '../dtos/create.dto';
import {
  FindAllCounsellorsQueryDto,
  FindAllCounsellorsResDto,
  FindOneCounsellorResDto,
} from '../dtos/find.dto';
import { UpdateCounsellorPayloadDto } from '../dtos/update.dto';

@ApiTags('Counsellor: Admin Role')
@ApiCookieAuth()
@Controller('/admin/counsellors')
@UseGuards(AuthGuard(), RoleGuard)
@Roles([RolesEnum.ADMIN])
export class CounsellorAdminController {
  constructor(private readonly counsellorService: CounsellorService) {}

  @Post()
  async create(
    @Body() body: CreateCounsellorPayloadDto,
  ): Promise<CreateCounsellorResDto> {
    const counsellor = await this.counsellorService.create(body);

    return plainToInstance(CreateCounsellorResDto, counsellor, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  async findAll(@Query() query: FindAllCounsellorsQueryDto) {
    const result = await this.counsellorService.findAllPaginated(query);
    return {
      data: plainToInstance(FindAllCounsellorsResDto, result.data, {
        excludeExtraneousValues: true,
      }),
      count: result.count,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<FindOneCounsellorResDto> {
    const counsellor = await this.counsellorService.findOne(id);
    return plainToInstance(FindOneCounsellorResDto, counsellor, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateCounsellorPayloadDto,
  ): Promise<FindOneCounsellorResDto> {
    const counsellor = await this.counsellorService.update(id, body);
    return plainToInstance(FindOneCounsellorResDto, counsellor, {
      excludeExtraneousValues: true,
    });
  }

  @Post(':id/suspend')
  async suspend(@Param('id') id: string): Promise<void> {
    return this.counsellorService.suspend(id);
  }

  @Post(':id/activate')
  async activate(@Param('id') id: string): Promise<void> {
    return this.counsellorService.activate(id);
  }

  @Post(':id/reset-password')
  async resetPassword(@Param('id') id: string): Promise<void> {
    return this.counsellorService.resetPassword(id);
  }
}
