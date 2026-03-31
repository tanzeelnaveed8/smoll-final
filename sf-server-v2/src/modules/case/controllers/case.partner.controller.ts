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
import { AuthUser, GetUser } from 'src/decorators/get-user.decorator';
import { Roles } from 'src/decorators/role.decorator';
import { RoleGuard } from 'src/guards/role/role.guard';
import { RolesEnum } from '../../../guards/role/role.enum';
import { CasePartnerService } from '../services/case.partner.service';
import { CreateCaseQuotePayloadDto } from '../dto/create.dto';
import {
  FindAllCasesForPartnerQueryDto,
  FindAllCasesForPartnerResDto,
  FindOneCaseForPartnerResDto,
} from '../dto/find.partner.dto';
import {
  getPaginationResponseSchema,
  PaginationResult,
} from 'src/utils/pagination';
import { plainToInstance } from 'class-transformer';
import { UpdateCaseQuotePayloadDto } from '../dto/update.dto';

@ApiTags('Case: Partner Role')
@Controller('/partner/cases')
@ApiBearerAuth()
@UseGuards(AuthGuard(), RoleGuard)
@Roles([RolesEnum.PARTNER])
@ApiExtraModels(FindAllCasesForPartnerResDto) // For complex response structure eg: `getPaginationResponseSchema`
export class CasePartnerController {
  constructor(private readonly caseService: CasePartnerService) {}

  @ApiResponse({
    schema: getPaginationResponseSchema(FindAllCasesForPartnerResDto),
  })
  @Get('/')
  async findAll(
    @GetUser() user: AuthUser,
    @Query() query: FindAllCasesForPartnerQueryDto,
  ): Promise<PaginationResult<FindAllCasesForPartnerResDto>> {
    const res = await this.caseService.findAll(user, query);

    const casesRes = plainToInstance(FindAllCasesForPartnerResDto, res.data, {
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
  ): Promise<FindOneCaseForPartnerResDto> {
    const _case = await this.caseService.findOne(user, id, {
      pet: {
        healthHistory: true,
      },
      partnerCosts: {
        partner: true,
      },
      member: true,
      assignedVet: true,
      partnerBooking: {
        partner: true,
        vet: true,
      },
    });

    const transformedQuotes = _case.partnerCosts
      ?.filter((quote) => quote.partner.id === user.id)
      .map((quote) => ({
        ...quote,
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
      quote: transformedQuotes,
    };

    return plainToInstance(FindOneCaseForPartnerResDto, transformedCase, {
      excludeExtraneousValues: true,
    });
  }

  @Post(':id/quote')
  createQuote(
    @GetUser() user: AuthUser,
    @Param('id') id: string,
    @Body() body: CreateCaseQuotePayloadDto,
  ) {
    return this.caseService.createQuote(user, id, body);
  }

  @Patch(':id/quote/:quoteId')
  updateQuote(
    @GetUser() user: AuthUser,
    @Param('id') id: string,
    @Param('quoteId') quoteId: string,
    @Body() body: UpdateCaseQuotePayloadDto,
  ) {
    return this.caseService.updateQuote(user, id, quoteId, body);
  }

  @Delete(':id/quote/:quoteId')
  deleteQuote(
    @GetUser() user: AuthUser,
    @Param('id') id: string,
    @Param('quoteId') quoteId: string,
  ) {
    return this.caseService.deleteQuote(user, id, quoteId);
  }

  @Delete(':id')
  deleteCase(@GetUser() user: AuthUser, @Param('id') id: string) {
    return this.caseService.deleteCase(user, id);
  }
}
