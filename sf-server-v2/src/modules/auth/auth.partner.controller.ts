import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LoginByEmailDto } from './dtos/login.dto';
import { AuthService } from './services/auth.service';
import { Response } from 'express';
import { RolesEnum } from '../../guards/role/role.enum';

@ApiTags('Auth: Partner Role')
@Controller('/partner/auth')
export class AuthPartnerController {
  constructor(private authService: AuthService) {}

  @Post('/login')
  async login(
    @Body() body: LoginByEmailDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    const { accessToken, refreshToken } = await this.authService.loginWithEmail(
      body,
      RolesEnum.PARTNER,
    );

    const isProduction = process.env.ENVIRONMENT === 'production';

    res.cookie('sfAccessToken', accessToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 30,
      secure: true,
      sameSite: !isProduction ? 'none' : undefined,
    });

    res.cookie('sfRefreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 30,
      secure: true,
      sameSite: !isProduction ? 'none' : undefined,
    });

    return { message: 'Login successful' };
  }

  @Post('/logout')
  async logout(@Res({ passthrough: true }) res: Response): Promise<void> {
    res.clearCookie('sfAccessToken');
    res.clearCookie('sfRefreshToken');
  }
}
