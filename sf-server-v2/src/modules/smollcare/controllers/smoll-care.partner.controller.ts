/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Param, Post, Query, Res, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { SmollCarePartnerService } from '../services/smoll-care.partner.service';
import { SmollCareService } from '../smoll-care.service';
import { UseBenefitDto } from '../dto/use-benefit.dto';
import { SmollCareBenefitUsageResDto } from '../dto/find-dto';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from 'src/guards/role/role.guard';
import { Roles } from 'src/decorators/role.decorator';
import { RolesEnum } from 'src/guards/role/role.enum';
import { AuthUser, GetUser } from 'src/decorators/get-user.decorator';
import {
    BenefitUsageFilterDto,
    BenefitUsageSummaryDto,
    SmollCareBenefitUsageSummaryResDto,
} from 'src/modules/member/dtos/find.admin.dto';
import { SmollCareBenefitResDto } from '../dto/find-dto';
import { query } from 'express';
import { Response } from 'express'; // ✅ Use express Response
// import {
//     BenefitUsageFilterDto,
//     BenefitUsageSummaryDto,
//     SmollCareBenefitUsageSummaryResDto,
// } from 'src/modules/member/dtos/find.admin.dto';
import {
    getPaginationResponseSchema,
    PaginationResult,
} from 'src/utils/pagination';

@ApiCookieAuth()
@ApiTags('SmollCare: Partner')
@Controller('partner/smollcare')
@UseGuards(AuthGuard(), RoleGuard)
@Roles([RolesEnum.PARTNER])
export class SmollCarePartnerMemberController {
    constructor(
        private smollPartnerService: SmollCarePartnerService,
        private readonly smollCareService: SmollCareService
    ) { }

    @Get('pet/:id')
    async findPetWithCare(@Param('id') careId: string) {
        const petWithCare = await this.smollPartnerService.findPetWithCare(careId);
        return petWithCare;
    }

    @Post('benefit/use')
    async useBenefit(
        @Body() useBenefitDto: UseBenefitDto,
        @GetUser() user: AuthUser,
    ): Promise<SmollCareBenefitUsageResDto> {
        const usedBenefit = await this.smollPartnerService.useBenefit(
            useBenefitDto,
            user,
        );
        return plainToInstance(SmollCareBenefitUsageResDto, usedBenefit, {
            excludeExtraneousValues: true,
        });
    }

    @Get('benefit-usage')
    @ApiOkResponse({
        schema: getPaginationResponseSchema(SmollCareBenefitUsageSummaryResDto),
    })
    async getBenefitUsageSummary(
        @Query() query: BenefitUsageFilterDto,
        @GetUser() user: AuthUser,
    ): Promise<PaginationResult<SmollCareBenefitUsageSummaryResDto>> {
        const result = await this.smollCareService.getBenefitUsageSummary(
            query,
            user,
        );
        return {
            ...result,
            data: plainToInstance(SmollCareBenefitUsageSummaryResDto, result.data, {
                excludeExtraneousValues: true,
            }),
        };
    }

    @Get('benefit-usage/export-pdf')
    async exportBenefitUsagePDF(
        @Query() query: BenefitUsageFilterDto,
        @Res() res: Response,
        @GetUser() user: AuthUser,
    ) {
        const pdfBuffer = await this.smollCareService.exportBenefitUsageSummaryPDF(
            query,
            user,
        );

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="benefit-usage-summary.pdf"',
            'Content-Length': pdfBuffer.length,
        });

        res.send(pdfBuffer);
    }
}
