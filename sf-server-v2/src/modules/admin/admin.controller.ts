import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/decorators/role.decorator';
import { RoleGuard } from 'src/guards/role/role.guard';
import { AdminService } from './admin.service';
import { RolesEnum } from 'src/guards/role/role.enum';
import { FindAnalyticsResDto, FindOneAdminResDto } from './dtos/find.dto';
import { AuthUser, GetUser } from 'src/decorators/get-user.decorator';
import { plainToInstance } from 'class-transformer';

@ApiTags('Admin')
@Controller('/admin')
@ApiBearerAuth()
@UseGuards(AuthGuard(), RoleGuard)
@Roles([RolesEnum.ADMIN])
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('/me')
  async findMe(@GetUser() user: AuthUser): Promise<FindOneAdminResDto> {
    const admin = await this.adminService.findOneByEmail(user.email);

    return plainToInstance(FindOneAdminResDto, admin, {
      excludeExtraneousValues: true,
    });
  }

  @Get('/analytics')
  async findAnalytics(): Promise<FindAnalyticsResDto> {
    const raw = await this.adminService.findAnalytics();
    return plainToInstance(FindAnalyticsResDto, raw, {
      excludeExtraneousValues: true,
    });
  }
}
