import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './services/auth.service';
import { Response } from 'express';
import { PartnerService } from '../partner/services/partner.service';
import { Partner } from '../partner/entities/partner.entity';
import { VetAdminService } from '../vet/services/vet.admin.service';
import { ImpersonateLoginDto, MastermindLoginDto } from './dtos/login.dto';
import { MastermindGuard } from '../../guards/mastermind/mastermind.guard';

@ApiTags('Auth: Mastermind')
@Controller('/mastermind')
export class AuthMastermindController {
  constructor(
    private authService: AuthService,
    private vetAdminService: VetAdminService,
    private partnerService: PartnerService,
  ) {}

  @UseGuards(MastermindGuard)
  @Post('/impersonate')
  async impersonate(
    @Body() body: ImpersonateLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken, zegoToken, redirectUrl } =
      await this.authService.impersonateLogin(body.userId, body.role);

    const isProduction = process.env.ENVIRONMENT === 'production';

    res.cookie('sfAccessToken', accessToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 30,
      secure: true,
      sameSite: isProduction ? 'lax' : 'none',
      domain: '.smoll.me',
    });

    res.cookie('sfRefreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 30,
      secure: true,
      domain: '.smoll.me',
    });

    res.cookie('sfZegoToken', zegoToken, {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      secure: true,
      domain: '.smoll.me',
    });

    return {
      message: 'Login successful',
      redirectUrl,
    };
  }

  @Post('/login')
  async login(
    @Body() body: MastermindLoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    // Simple authentication for mastermind page
    const { username, password } = body;

    const mastermindCreds = {
      username: process.env.MASTERMIND_USERNAME || 'admin',
      password: process.env.MASTERMIND_PASSWORD || 'password',
    };

    if (
      username !== mastermindCreds.username ||
      password !== mastermindCreds.password
    ) {
      throw new Error('Invalid credentials');
    }

    // Set mastermind cookie for protected routes
    const mastermindToken =
      process.env.MASTERMIND_TOKEN || 'mastermind-secret-token';
    const isProduction = process.env.ENVIRONMENT === 'production';

    res.cookie('mastermind', mastermindToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 8, // 8 hours
      secure: true,
      sameSite: isProduction ? 'lax' : 'none',
    });

    return { message: 'Login successful' };
  }

  @UseGuards(MastermindGuard)
  @Get('/vets')
  async getAllVets(): Promise<any> {
    const result = await this.vetAdminService.findAll({});
    return result.data;
  }

  @UseGuards(MastermindGuard)
  @Get('/partners')
  async getAllPartners(): Promise<Partner[]> {
    return this.partnerService.findAll();
  }

  @UseGuards(MastermindGuard)
  @Post('/logout')
  async logout(
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    res.clearCookie('mastermind');
    return { message: 'Logout successful' };
  }
}
