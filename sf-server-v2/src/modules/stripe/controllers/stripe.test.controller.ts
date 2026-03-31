import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/decorators/role.decorator';
import { RoleGuard } from 'src/guards/role/role.guard';
import { RolesEnum } from 'src/guards/role/role.enum';
import { StripeService } from '../stripe.service';
import { ConfigService } from '@nestjs/config';

@ApiTags('Stripe Test')
@Controller('/member/stripe/test')
@UseGuards(AuthGuard(), RoleGuard)
@Roles([RolesEnum.MEMBER])
export class StripeTestController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly configService: ConfigService,
  ) {}

  @Get('config')
  async testConfig() {
    const stagingKey = this.configService.get('STAGING_STRIPE_SECRET_KEY');
    const regularKey = this.configService.get('STRIPE_SECRET_KEY');

    return {
      hasStagingKey: !!stagingKey,
      hasRegularKey: !!regularKey,
      stagingKeyPrefix: stagingKey ? stagingKey.substring(0, 12) : 'NOT_FOUND',
      regularKeyPrefix: regularKey ? regularKey.substring(0, 12) : 'NOT_FOUND',
      usingKey: stagingKey || regularKey ? (stagingKey || regularKey).substring(0, 12) : 'NONE',
    };
  }

  @Get('validate')
  async testValidation() {
    try {
      // Try to create a test customer
      const testCustomer = await this.stripeService.createStripeCustomer(
        undefined,
        'test@example.com',
      );

      return {
        success: true,
        customerId: testCustomer,
        message: 'Stripe API is working correctly',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        type: error.type,
        code: error.code,
        statusCode: error.statusCode,
      };
    }
  }
}
