import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

@ApiTags('Stripe Debug')
@Controller('/stripe-debug')
export class StripeDebugController {
  constructor(private readonly configService: ConfigService) {}

  @Get('env-check')
  checkEnvironment() {
    const stagingSecret = this.configService.get('STAGING_STRIPE_SECRET_KEY');
    const regularSecret = this.configService.get('STRIPE_SECRET_KEY');
    const stagingPublic = this.configService.get('STAGING_STRIPE_PUBLISHABLE_KEY');
    const regularPublic = this.configService.get('STRIPE_PUBLISHABLE_KEY');

    return {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      keys: {
        hasStagingSecret: !!stagingSecret,
        hasRegularSecret: !!regularSecret,
        hasStagingPublic: !!stagingPublic,
        hasRegularPublic: !!regularPublic,
        stagingSecretPrefix: stagingSecret ? stagingSecret.substring(0, 15) + '...' : 'NOT_FOUND',
        regularSecretPrefix: regularSecret ? regularSecret.substring(0, 15) + '...' : 'NOT_FOUND',
        usingSecret: (stagingSecret || regularSecret) ? (stagingSecret || regularSecret).substring(0, 15) + '...' : 'NONE',
      },
      message: 'This endpoint is public for debugging. Remove in production!',
    };
  }
}
