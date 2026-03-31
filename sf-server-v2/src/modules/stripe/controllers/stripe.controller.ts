import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { Roles } from 'src/decorators/role.decorator';
import { GetUser, AuthUser } from 'src/decorators/get-user.decorator';
import { RoleGuard } from 'src/guards/role/role.guard';
import { RolesEnum } from 'src/guards/role/role.enum';
import { StripeService } from '../stripe.service';
import {
  CreatePaymentSessionDto,
  CreatePaymentSessionResponseDto,
} from '../dtos/create.dto';
import { MemberService } from '../../member/services/member.service';

@ApiTags('Stripe')
@Controller('/member/stripe')
@UseGuards(AuthGuard(), RoleGuard)
@Roles([RolesEnum.MEMBER])
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly memberService: MemberService,
  ) {}

  @Post('create-payment-session')
  async createPaymentSession(
    @Body() body: CreatePaymentSessionDto,
  ): Promise<CreatePaymentSessionResponseDto> {
    const paymentSession = await this.stripeService.createPaymentSession(body);

    return plainToInstance(CreatePaymentSessionResponseDto, paymentSession);
  }

  @Post('create-customer')
  async createCustomer(
    @GetUser() user: AuthUser,
  ): Promise<{ customerId: string }> {
    const member = await this.memberService.findOne(user.id);

    // If we have a stored ID, verify it still exists in Stripe
    if (member.stripeCustomerId) {
      const isValid = await this.stripeService.validateCustomer(
        member.stripeCustomerId,
      );
      if (isValid) {
        return { customerId: member.stripeCustomerId };
      }
      // Customer was deleted from Stripe — clear it so we create a fresh one below
    }

    try {
      // Create a new Stripe customer and save to DB
      await this.memberService.updateStripeId(
        member.id,
        member.phone ?? undefined,
        member.email ?? undefined,
      );

      const updated = await this.memberService.findOne(user.id);
      return { customerId: updated.stripeCustomerId };
    } catch (error) {
      console.error('Failed to create Stripe customer:', error);
      throw new BadRequestException(
        `Failed to create Stripe customer: ${error.message}`,
      );
    }
  }

  @Get('setup-intent')
  async getSetupIntent(@Query('memberId') memberId: string) {
    const member = await this.memberService.findOne(memberId);

    if (!member?.stripeCustomerId) {
      throw new BadRequestException('Member must have Stripe customer ID.');
    }

    const setupIntent = await this.stripeService.createSetupIntent(
      member.stripeCustomerId,
    );
    return { clientSecret: setupIntent.client_secret };
  }
}
