import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
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
  FindAllMemberQueryDto,
  FindAllMemberResDto,
  FindOneMemberResDto,
} from '../dtos/find.admin.dto';
import { MemberAdminService } from '../services/member.admin.service';

@ApiTags('Member: Admin Role')
@ApiCookieAuth()
@Controller('/admin/members')
@UseGuards(AuthGuard(), RoleGuard)
@Roles([RolesEnum.ADMIN])
@ApiExtraModels(FindAllMemberResDto) // For complex response structure eg: `getPaginationResponseSchema`
export class MemberAdminController {
  constructor(private readonly memberService: MemberAdminService) {}

  @ApiResponse({
    schema: getPaginationResponseSchema(FindAllMemberResDto),
  })
  @Get()
  async findAll(
    @Query() query: FindAllMemberQueryDto,
  ): Promise<PaginationResult<FindAllMemberResDto>> {
    const res = await this.memberService.findAll(query);

    const members = plainToInstance(FindAllMemberResDto, res.data, {
      excludeExtraneousValues: true,
    });

    return {
      ...res,
      data: members,
    };
  }

  @Get('/:id')
  async findOne(@Param('id') id: string): Promise<FindOneMemberResDto> {
    const member = await this.memberService.findOne(id);

    return plainToInstance(FindOneMemberResDto, member, {
      excludeExtraneousValues: true,
    });
  }

  @Post()
  async create(
    @Body()
    body: {
      name: string;
      email?: string;
      phone?: string;
      address?: string;
      villa?: string;
      city?: string;
      country?: string;
    },
  ) {
    return this.memberService.create(body);
  }

  @Patch('/:id')
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      email?: string;
      phone?: string;
      address?: string;
      villa?: string;
      city?: string;
      country?: string;
    },
  ) {
    return this.memberService.update(id, body);
  }

  @Delete('/:id')
  async remove(@Param('id') id: string) {
    return this.memberService.remove(id);
  }
}
