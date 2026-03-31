import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { AuthUser, GetUser } from 'src/decorators/get-user.decorator';
import { Roles } from 'src/decorators/role.decorator';
import { RolesEnum } from 'src/guards/role/role.enum';
import { RoleGuard } from 'src/guards/role/role.guard';
import { PetSubscriptionSetupResponseDto } from 'src/modules/stripe/dtos/pet-subscription.dto';
import {
  FindBenefitsQueryDto,
  SmollCareBenefitResDto,
  VerifyCodePayloadDto,
} from '../dto/find-dto';
import { usedBenefitPayloadDto } from '../dto/used-benefits.payload.dto';
import { SmollCareMemberService } from '../services/smoll-care.member.service';
import { StripeService } from 'src/modules/stripe/stripe.service';

@ApiCookieAuth()
@ApiTags('SmollCare: Member')
@Controller('/member/smollcare')
@UseGuards(AuthGuard(), RoleGuard)
@Roles([RolesEnum.MEMBER])
export class SmollCareMemberController {
  constructor(
    private memberService: SmollCareMemberService,
    private stripeService: StripeService,
  ) {}

  @Post('subscribe/:id')
  async createSubscription(
    @Param('id') petId: string,
    @Body() body: { coupon?: string },
    @GetUser() user: AuthUser,
  ): Promise<PetSubscriptionSetupResponseDto> {
    const response = this.memberService.createSubscription(
      petId,
      user.id,
      body.coupon,
    );

    return plainToInstance(PetSubscriptionSetupResponseDto, response, {
      excludeExtraneousValues: true,
    });
  }

  @Post('coupon/verify')
  async veryfyCoupon(@Body() body: VerifyCodePayloadDto) {
    const { code } = body;
    const coupon = this.stripeService.verifyCoupon(code);
    return coupon;
  }

  @Delete('cancel/subscription/:id')
  async cancelPetSubscription(
    @Param('id') petId: string,
    @GetUser() user: AuthUser,
  ) {
    return await this.stripeService.cancelPetSubscription(petId, user);
  }

  @Post('activate/subscription/:id')
  async activatePetSubscription(@Param('id') petId: string) {
    return await this.stripeService.activePetSubscription(petId);
  }

  @Get('/benefits')
  async findPlanBenefits(
    @Query() query: FindBenefitsQueryDto,
  ): Promise<SmollCareBenefitResDto> {
    const petId = query.petId
    const benefits = this.memberService.findPlanBenefits(petId);

    return plainToInstance(SmollCareBenefitResDto, benefits, {
      excludeExtraneousValues: true,
    });
  }

  @Get('/pet/:id/used-benefits')
  async findUsedBenefits(@Param() payload: usedBenefitPayloadDto) {
    const { petId } = payload;
    const benefits = await this.memberService.findUsedBenefits(petId);
    return benefits;
  }
}
