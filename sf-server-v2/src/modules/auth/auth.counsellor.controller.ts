import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LoginByEmailDto } from './dtos/login.dto';
import { AuthService } from './services/auth.service';
import { Response } from 'express';
import { RolesEnum } from '../../guards/role/role.enum';

@ApiTags('Auth: Counsellor Role')
@Controller('/counsellor/auth')
export class AuthCounsellorController {
  constructor(private authService: AuthService) {}

  @Post('/login')
  async login(
    @Body() body: LoginByEmailDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    const { accessToken, refreshToken } = await this.authService.loginWithEmail(
      body,
      RolesEnum.COUNSELLOR,
    );

    res.cookie('sfAccessToken', accessToken, { httpOnly: true });
    res.cookie('sfRefreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });

    return { message: 'Login successful' };
  }
}
