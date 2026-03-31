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
} from '../dtos/find.admin.dto';
import { MemberAdminService } from '../services/member.admin.service';

@ApiTags('Vet Admin: Customers')
@ApiCookieAuth()
@Controller('/admin/vet-members')
@UseGuards(AuthGuard(), RoleGuard)
@Roles([RolesEnum.ADMIN])
@ApiExtraModels(FindAllMemberResDto)
export class VetMemberAdminController {
  constructor(private readonly memberService: MemberAdminService) {}

  @ApiResponse({
    schema: getPaginationResponseSchema(FindAllMemberResDto),
  })
  @Get()
  async findAll(
    @Query() query: FindAllMemberQueryDto,
  ): Promise<PaginationResult<FindAllMemberResDto>> {
    const res = await this.memberService.findAllVetCustomers(query);

    const members = plainToInstance(FindAllMemberResDto, res.data, {
      excludeExtraneousValues: true,
    });

    return {
      ...res,
      data: members,
    };
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
      petInfo?: string;
    },
  ) {
    return this.memberService.createVetCustomer(body);
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
      petInfo?: string;
    },
  ) {
    return this.memberService.update(id, body);
  }

  @Delete('/:id')
  async remove(@Param('id') id: string) {
    return this.memberService.remove(id);
  }
}

