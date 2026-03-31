import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { AuthUser, GetUser } from 'src/decorators/get-user.decorator';
import { Roles } from 'src/decorators/role.decorator';
import { RoleGuard } from 'src/guards/role/role.guard';
import { RolesEnum } from '../../../guards/role/role.enum';
import { SocketEventEnum } from '../../socket/socket-event.enum';
import { SocketService } from '../../socket/socket.service';
import {
  CreateCasePayloadDto,
  CreateCaseQueryDto,
  CreateCaseResDto,
} from '../dto/create.dto';
import {
  UpdateCasePayloadDto,
  UpdateCaseQueryDto,
  UpdateCaseResDto,
} from '../dto/update.dto';
import { CaseMemberService } from '../services/case.member.service';
import {
  FindAllCasesForMemberQueryDto,
  FindAllCasesForMemberResDto,
  FindOneCaseForMemberResDto,
  FindQuotesForMemberResDto,
} from '../dto/find.member.dto';
import {
  getPaginationResponseSchema,
  PaginationResult,
} from 'src/utils/pagination';
import { Logger } from 'src/configs/logger';

@ApiTags('Case: Member Role')
@Controller('/member/cases')
@ApiBearerAuth()
@UseGuards(AuthGuard(), RoleGuard)
@Roles([RolesEnum.MEMBER])
@ApiExtraModels(FindAllCasesForMemberResDto) // For complex response structure eg: `getPaginationResponseSchema`
export class CaseMemberController {
  private readonly logger = Logger.getInstance();

  constructor(
    private readonly caseService: CaseMemberService,
    private readonly socketService: SocketService,
  ) {}

  @ApiResponse({
    schema: getPaginationResponseSchema(FindAllCasesForMemberResDto),
  })
  @Get()
  async findAll(
    @GetUser() user: AuthUser,
    @Query() query: FindAllCasesForMemberQueryDto,
  ): Promise<PaginationResult<FindAllCasesForMemberResDto>> {
    const res = await this.caseService.findAll(user, query);

    this.logger.info(
      `[LOG: CASE_MEMBER_CONTROLLER] res: ${JSON.stringify(res)}`,
    );

    const casesRes = plainToInstance(FindAllCasesForMemberResDto, res.data, {
      excludeExtraneousValues: true,
    });

    // Force the boolean values to be explicit booleans
    const processedData = casesRes.map((item) => ({
      ...item,
      hasNewQuotation: item.hasNewQuotation === true,
    }));

    const finalRes = {
      ...res,
      data: processedData,
    };

    this.logger.info(
      `[LOG: CASE_MEMBER_CONTROLLER] finalRes: ${JSON.stringify(finalRes)}`,
    );

    return finalRes;
  }

  @Get(':id')
  async findOne(
    @GetUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<FindOneCaseForMemberResDto> {
    const _case = await this.caseService.findOne(user, id);

    return plainToInstance(FindOneCaseForMemberResDto, _case, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':id/quotes')
  async findQuotes(
    @GetUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<FindQuotesForMemberResDto[]> {
    const _case = await this.caseService.findQuotes(user, id);

    const quotes = _case.partnerCosts.map((p) => ({
      ...p,
      isEmergency: _case.isEmergency,
      isDirectEscalated: _case.isDirectEscalated,
      pet: _case.pet,
    }));

    return plainToInstance(FindQuotesForMemberResDto, quotes, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id/quotes/:quotationId/read')
  async markCostAsViewed(
    @GetUser() member: AuthUser,
    @Param('id') id: string,
    @Param('quotationId') quotationId: string,
  ) {
    return await this.caseService.markCaseQuotationAsViewed(
      member,
      id,
      quotationId,
    );
  }

  @Post()
  async create(
    @GetUser() user: AuthUser,
    @Query() query: CreateCaseQueryDto,
    @Body() body: CreateCasePayloadDto,
  ): Promise<CreateCaseResDto> {
    const _case = await this.caseService.create(user, query, body);

    const res = plainToInstance(CreateCaseResDto, _case, {
      excludeExtraneousValues: true,
    });

    this.socketService.emit(SocketEventEnum.CASE_CREATED, res);

    return res;
  }

  @Patch(':id')
  async update(
    @GetUser() user: AuthUser,
    @Param('id') id: string,
    @Query() query: UpdateCaseQueryDto,
    @Body() body: UpdateCasePayloadDto,
  ) {
    const _case = await this.caseService.update(user, id, query, body);

    const res = plainToInstance(UpdateCaseResDto, _case, {
      excludeExtraneousValues: true,
    });

    return res;
  }

  @Delete(':id')
  async delete(@GetUser() user: AuthUser, @Param('id') id: string) {
    return this.caseService.delete(user, id);
  }
}
