import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { SmollCareService } from '../smoll-care.service';
import { CreateBenefit } from '../dto/create-benefit.dto';
import { SmollCareBenefitResDto } from '../dto/find-dto';
import { plainToInstance } from 'class-transformer';
import { RolesEnum } from 'src/guards/role/role.enum';
import { Roles } from 'src/decorators/role.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from 'src/guards/role/role.guard';
import { CreateSmollCarePlanDto } from '../dto/create-plan.dto';

@ApiTags('Smoll Care')
@ApiCookieAuth() // Assumes cookie auth is set up
@Controller('smollcare') // Consistent lowercase module name
@UseGuards(AuthGuard(), RoleGuard)
@Roles([RolesEnum.ADMIN])
export class SmollCareController {
  constructor(private readonly smollCareService: SmollCareService) { }

  @Post('add-benefit')
  async addBenefit(
    @Body() benefitDetails: CreateBenefit,
  ): Promise<SmollCareBenefitResDto> {
    const benefit = this.smollCareService.addBenefit(benefitDetails);
    return plainToInstance(SmollCareBenefitResDto, benefit, {
      excludeExtraneousValues: true,
    });
  }

  @Post('plan')
  async createPlan(@Body() body: CreateSmollCarePlanDto) {
    return await this.smollCareService.createPlan(body);
  }
}
