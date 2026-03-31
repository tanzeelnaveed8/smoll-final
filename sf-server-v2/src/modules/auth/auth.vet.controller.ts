import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LoginByEmailDto } from './dtos/login.dto';
import { AuthService } from './services/auth.service';
import { Request, Response } from 'express';
import { RolesEnum } from '../../guards/role/role.enum';

@ApiTags('Auth: Vet Role')
@Controller('/vet/auth')
export class AuthVetController {
  constructor(private authService: AuthService) {}

  @Post('/login')
  async login(
    @Body() body: LoginByEmailDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string; tokens: { zegoToken: string } }> {
    const { accessToken, refreshToken, zegoToken } =
      await this.authService.loginWithEmail(body, RolesEnum.VET);

    const isProduction = process.env.ENVIRONMENT === 'production';
    // In dev (HTTP localhost), secure: true prevents browser from saving cookies
    const cookieOpts = {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
      secure: isProduction,
      sameSite: (isProduction ? undefined : 'lax') as 'lax' | 'strict' | 'none' | undefined,
    };

    res.cookie('sfAccessToken', accessToken, cookieOpts);
    res.cookie('sfRefreshToken', refreshToken, {
      ...cookieOpts,
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });
    res.cookie('sfZegoToken', zegoToken, cookieOpts);

    return {
      message: 'Login successful',
      tokens: {
        zegoToken,
      },
    };
  }

  @Post('/refresh-token')
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies['sfRefreshToken'];
    const { accessToken, zegoToken } =
      await this.authService.refreshToken(refreshToken);

    res.cookie('sfAccessToken', accessToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
    });

    return { accessToken, zegoToken };
  }

  @Post('/logout')
  async logout(@Res({ passthrough: true }) res: Response): Promise<void> {
    res.clearCookie('sfAccessToken');
    res.clearCookie('sfRefreshToken');
    res.clearCookie('sfZegoToken');
  }
}
