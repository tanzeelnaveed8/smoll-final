import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { Roles } from 'src/decorators/role.decorator';
import { RoleGuard } from 'src/guards/role/role.guard';
import {
  PaginationResult,
  getPaginationResponseSchema,
} from 'src/utils/pagination';
import { RolesEnum } from '../../../guards/role/role.enum';
import {
  FindAllCasesAdminQueryDto,
  FindAllCasesResDto,
} from '../dto/find.admin.dto';
import { CaseAdminService } from '../services/case.admin.service';

@ApiTags('Case: Admin Role')
@Controller('/admin/cases')
@ApiBearerAuth()
@UseGuards(AuthGuard(), RoleGuard)
@Roles([RolesEnum.ADMIN])
@ApiExtraModels(FindAllCasesResDto) // For complex response structure eg: `getPaginationResponseSchema`
export class CaseAdminController {
  constructor(private readonly caseService: CaseAdminService) {}

  @ApiResponse({
    schema: getPaginationResponseSchema(FindAllCasesResDto),
  })
  @Get()
  async findAll(
    @Query() query: FindAllCasesAdminQueryDto,
  ): Promise<PaginationResult<FindAllCasesResDto>> {
    const res = await this.caseService.findAll(query);

    const casesRes = res.data.map((_case: any) => {
      const checklist = Array.isArray(_case.serviceChecklist) ? _case.serviceChecklist : [];
      const totalAmount = checklist.reduce((sum: number, item: any) => {
        const price = typeof item?.price === 'number' ? item.price : 0;
        return sum + price;
      }, 0);

      return plainToInstance(
        FindAllCasesResDto,
        {
          ..._case,
          totalAmount,
        },
        { excludeExtraneousValues: true },
      );
    });

    return {
      ...res,
      data: casesRes,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.caseService.findOne(id);
  }

  @Post()
  async create(
    @Body() body: { memberId: string; petId: string; vetId: string; description: string; scheduledAt?: string },
  ) {
    return await this.caseService.createCase({
      ...body,
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
    });
  }

  @Post(':id/notes')
  async addNote(
    @Param('id') id: string,
    @Body() body: { note: string; author: string },
  ) {
    return await this.caseService.addNote(id, body.note, body.author);
  }

  @Post(':id/cancel')
  async cancel(@Param('id') id: string) {
    return await this.caseService.cancelCase(id);
  }
}
