import {
  Body,
  Controller,
  ForbiddenException,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { RoleGuard } from 'src/guards/role/role.guard';
import { OrganizationService } from '../organization/organization.service';
import { VerifyOtpDto } from '../verify/dto/verify.dto';
import { LoginByPhoneDto } from './dtos/login.dto';
import { RegisterMemberDto } from './dtos/register.dto';
import { AuthService } from './services/auth.service';
import { Organization } from '../organization/entities/organization.entity';

@ApiTags('Auth: Member Role')
@Controller('/member/auth')
@UseGuards(RoleGuard)
export class AuthMemberController {
  constructor(
    private authService: AuthService,
    private readonly organizationService: OrganizationService,
  ) {}

  @Post('/register')
  async register(@Body() body: RegisterMemberDto): Promise<void> {
    return await this.authService.register(body);
  }

  @Post('/login')
  async login(@Body() body: LoginByPhoneDto): Promise<void> {
    return await this.authService.loginWithPhoneOrEmail(body);
  }

  @Post('/dev-login')
  async devLogin(
    @Body() body: LoginByPhoneDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (process.env.ENVIRONMENT === 'production') {
      throw new ForbiddenException('Dev login is disabled in production');
    }

    let subscription: string = 'smollBasic';
    let organization: Organization;

    const { accessToken, refreshToken, zegoToken, loginWithEmail } =
      await this.authService.devLoginBypassOtp(body);

    if (loginWithEmail && body.email) {
      const domain = body.email.split('@')[1];
      if (!domain) {
        throw new UnauthorizedException('Invalid email domain');
      }

      organization = await this.organizationService.findByDomain(domain);

      if (organization && organization.isSmollVetAccessValid()) {
        subscription = 'smollVet';
      }
    }

    const envs = {
      ONESIGNAL_APP_ID: process.env.ONESIGNAL_APP_ID,
      STRIPE_PUBLISHABLE_KEY: process.env.STAGING_STRIPE_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY,
      ZEGO_APP_ID: process.env.ZEGO_APP_ID,
      ZEGO_SERVER_SECRET: process.env.ZEGO_SERVER_SECRET,
      ZEGO_APP_SIGN: process.env.ZEGO_APP_SIGN,
    };

    res.cookie('sfAccessToken', accessToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
    });
    res.cookie('sfRefreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });

    return {
      accessToken,
      refreshToken,
      zegoToken,
      envs,
      subscription,
      organization: subscription === 'smollVet' ? organization : null,
    };
  }

  @Post('/verify-otp')
  async verifyOtp(
    @Body() body: VerifyOtpDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    let subscription: string = 'smollBasic';
    let organization: Organization;
    const { accessToken, refreshToken, zegoToken, loginWithEmail } =
      await this.authService.verifyOtp(body);

    if (loginWithEmail) {
      const domain = body.email.split('@')[1];
      if (!domain) {
        throw new UnauthorizedException('Invalid email domain');
      }

      organization = await this.organizationService.findByDomain(domain);

      if (organization && organization.isSmollVetAccessValid()) {
        subscription = 'smollVet';
      }
    }

    const envs = {
      ONESIGNAL_APP_ID: process.env.ONESIGNAL_APP_ID,
      STRIPE_PUBLISHABLE_KEY: process.env.STAGING_STRIPE_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY,
      ZEGO_APP_ID: process.env.ZEGO_APP_ID,
      ZEGO_SERVER_SECRET: process.env.ZEGO_SERVER_SECRET,
      ZEGO_APP_SIGN: process.env.ZEGO_APP_SIGN,
    };

    res.cookie('sfAccessToken', accessToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
    });
    res.cookie('sfRefreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });

    return {
      accessToken,
      refreshToken,
      zegoToken,
      envs,
      subscription,
      organization: subscription === 'smollVet' ? organization : null,
    };
  }

  @Post('/refresh-token')
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies['sfRefreshToken'];
    let subscription: string = 'smollBasic';
    let organization: Organization;
    const { accessToken, zegoToken, loginWithEmail, email } =
      await this.authService.refreshToken(refreshToken);

    if (loginWithEmail && email) {
      const domain = email.split('@')[1];
      if (!domain) {
        throw new UnauthorizedException('Invalid email domain');
      }

      organization = await this.organizationService.findByDomain(domain);

      if (organization && organization.isSmollVetAccessValid()) {
        subscription = 'smollVet';
      }
    }

    res.cookie('sfAccessToken', accessToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
    });

    return {
      accessToken,
      zegoToken,
      subscription,
      organization: subscription === 'smollVet' ? organization : null,
    };
  }
}
