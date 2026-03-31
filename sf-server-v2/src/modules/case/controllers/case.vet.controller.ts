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
  ApiBearerAuth,
  ApiExtraModels,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/decorators/role.decorator';
import { RoleGuard } from 'src/guards/role/role.guard';
import { RolesEnum } from '../../../guards/role/role.enum';
import { CaseVetService } from '../services/case.vet.service';
import { AuthUser, GetUser } from 'src/decorators/get-user.decorator';
import {
  FindAllCasesForVetQueryDto,
  FindAllCasesForVetResDto,
  FindOneCaseForVetResDto,
} from '../dto/find.vet.dto';
import { plainToInstance } from 'class-transformer';
import {
  PaginationResult,
  getPaginationResponseSchema,
} from 'src/utils/pagination';
import {
  AddNotePayloadDto,
  CloseCasePayloadDto,
  DirectEscalatePayloadDto,
  EscalatePayloadDto,
} from '../dto/create.dto';
import { SocketEventEnum } from 'src/modules/socket/socket-event.enum';
import { SocketService } from 'src/modules/socket/socket.service';

@ApiTags('Case: Vet Role')
@Controller('/vet/cases')
@ApiBearerAuth()
@UseGuards(AuthGuard(), RoleGuard)
@Roles([RolesEnum.VET])
@ApiExtraModels(FindAllCasesForVetResDto) // For complex response structure eg: `getPaginationResponseSchema`
export class CaseVetController {
  constructor(
    private readonly caseService: CaseVetService,
    private readonly socketService: SocketService,
  ) {}

  @ApiResponse({
    schema: getPaginationResponseSchema(FindAllCasesForVetResDto),
  })
  @Get()
  async findAll(
    @GetUser() user: AuthUser,
    @Query() query: FindAllCasesForVetQueryDto,
  ): Promise<PaginationResult<FindAllCasesForVetResDto>> {
    const res = await this.caseService.findAll(user, query);

    const casesRes = plainToInstance(FindAllCasesForVetResDto, res.data, {
      excludeExtraneousValues: true,
    });

    return {
      ...res,
      data: casesRes,
    };
  }

  @Get(':id')
  async findOne(
    @GetUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<FindOneCaseForVetResDto> {
    const _case = await this.caseService.findOne(user, id);

    // Transform the quotes to include isSelected properties
    const transformedQuotes = _case.partnerCosts?.map((quote) => ({
      ...quote,
      partner: {
        ...quote.partner,
        isSelected: _case.partnerBooking?.partner?.id === quote?.partner?.id,
      },
      services: quote.services.map((service) => ({
        ...service,
        isSelected:
          _case.partnerBooking?.services.some((s) => s.id === service.id) ||
          false,
      })),
    }));

    // Create a new object with the transformed quotes
    const transformedCase = {
      ..._case,
      quotes: transformedQuotes,
    };

    return plainToInstance(FindOneCaseForVetResDto, transformedCase, {
      excludeExtraneousValues: true,
    });
  }

  @Post(':id/notes')
  async addNote(
    @GetUser() user: AuthUser,
    @Param('id') id: string,
    @Body() body: AddNotePayloadDto,
  ): Promise<void> {
    await this.caseService.addNote(user, id, body);
  }

  @Patch(':id/service-checklist')
  async updateServiceChecklist(
    @GetUser() user: AuthUser,
    @Param('id') id: string,
    @Body() body: { checklist: { name: string; checked: boolean }[] },
  ): Promise<void> {
    await this.caseService.updateServiceChecklist(user, id, body.checklist);
  }

  @Post(':id/customer-not-reachable')
  async markCustomerNotReachable(
    @GetUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<void> {
    await this.caseService.markCustomerNotReachable(user, id);
  }

  @Patch(':id/assets')
  async addAssets(
    @GetUser() user: AuthUser,
    @Param('id') id: string,
    @Body() body: { assets: { filename: string; filesize: number; mimetype: string; url: string }[] },
  ): Promise<void> {
    await this.caseService.addAssets(user, id, body.assets);
  }

  @Post(':id/escalate')
  async escalate(
    @GetUser() user: AuthUser,
    @Param('id') id: string,
    @Body() body: EscalatePayloadDto,
  ): Promise<void> {
    await this.caseService.escalate(user, id, body);
  }

  @Post(':id/direct-escalate')
  async directEscalate(
    @GetUser() user: AuthUser,
    @Param('id') id: string,
    @Body() body: DirectEscalatePayloadDto,
  ): Promise<void> {
    await this.caseService.directEscalate(user, id, body);
  }

  @Post(':id/close')
  async close(
    @GetUser() user: AuthUser,
    @Param('id') id: string,
    @Body() body: CloseCasePayloadDto,
  ): Promise<void> {
    const _case = await this.caseService.closeCase(user, id, body);

    this.socketService.emit(SocketEventEnum.VET_CLOSE_CONSULTATION, {
      consultationId: _case.vetConsultation.id,
      vetId: user.id,
    });
  }
}
