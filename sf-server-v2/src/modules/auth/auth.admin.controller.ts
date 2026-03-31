import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { LoginByEmailDto } from './dtos/login.dto';
import { VerifyAdminOtpDto } from './dtos/verify-admin.dto';
import { ChangeAdminPasswordDto } from './dtos/change-password.dto';
import { AuthService } from './services/auth.service';
import { Roles } from 'src/decorators/role.decorator';
import { RolesEnum } from 'src/guards/role/role.enum';
import { RoleGuard } from 'src/guards/role/role.guard';
import { AuthGuard } from '@nestjs/passport';
import { GetUser, AuthUser } from 'src/decorators/get-user.decorator';

@ApiTags('Auth: Admin Role')
@Controller('/admin/auth')
export class AuthAdminController {
  constructor(private authService: AuthService) {}

  @Post('/login')
  async login(@Body() body: LoginByEmailDto): Promise<{ message: string }> {
    await this.authService.initAdminEmailOtp(body);
    return { message: 'OTP sent to registered admin email' };
  }

  @Post('/verify-otp')
  async verifyOtp(
    @Body() body: VerifyAdminOtpDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    const { accessToken, refreshToken } = await this.authService.verifyAdminOtp(
      body.email,
      body.otp,
    );

    const isProduction = process.env.ENVIRONMENT === 'production';

    res.cookie('sfAccessToken', accessToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
      secure: isProduction,
      sameSite: !isProduction ? 'lax' : undefined,
    });
    res.cookie('sfRefreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
      secure: isProduction,
      sameSite: !isProduction ? 'lax' : undefined,
    });

    return { message: 'Login successful' };
  }

  @Post('/logout')
  async logout(@Res({ passthrough: true }) res: Response): Promise<void> {
    const isProduction = process.env.ENVIRONMENT === 'production';
    res.clearCookie('sfAccessToken', {
      httpOnly: true,
      secure: isProduction,
    });
    res.clearCookie('sfRefreshToken', {
      httpOnly: true,
      secure: isProduction,
    });
  }

  @Post('/change-password')
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles([RolesEnum.ADMIN])
  async changePassword(
    @GetUser() user: AuthUser,
    @Body() body: ChangeAdminPasswordDto,
  ): Promise<{ message: string }> {
    await this.authService.changeAdminPassword(user, body);
    return { message: 'Password changed successfully' };
  }
}
