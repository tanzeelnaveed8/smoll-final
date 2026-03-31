import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import {
  FindAllNotificationResDto,
  ReadNotificationQueryDto,
} from './dto/find.dto';
import { plainToInstance } from 'class-transformer';
import { AuthGuard } from '@nestjs/passport';
import { AuthUser, GetUser } from 'src/decorators/get-user.decorator';
import { RoleGuard } from 'src/guards/role/role.guard';
import { RolesEnum } from 'src/guards/role/role.enum';
import { Roles } from 'src/decorators/role.decorator';
import {
  PaginationQueryDto,
  PaginationResult,
  getPaginationResponseSchema,
} from 'src/utils/pagination';
import { SendOneSignalNotificationDto } from './dto/create.dto';

@ApiTags('Notification')
@ApiBearerAuth()
@UseGuards(AuthGuard(), RoleGuard)
@Controller('notifications')
@Roles([
  RolesEnum.COUNSELLOR,
  RolesEnum.MEMBER,
  RolesEnum.PARTNER,
  RolesEnum.VET,
])
@ApiExtraModels(FindAllNotificationResDto) // For complex response structure eg: `getPaginationResponseSchema`
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @ApiResponse({
    schema: getPaginationResponseSchema(FindAllNotificationResDto),
  })
  @Get()
  async findAll(
    @GetUser() user: AuthUser,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginationResult<FindAllNotificationResDto>> {
    const res = await this.notificationService.findAll(user, query);

    const notifications = plainToInstance(FindAllNotificationResDto, res.data, {
      excludeExtraneousValues: true,
    });

    return {
      ...res,
      data: notifications,
    };
  }

  @Post('read')
  async readNotifications(
    @GetUser() user: AuthUser,
    @Query() readQueryDto: ReadNotificationQueryDto,
  ) {
    await this.notificationService.readNotifications(user, readQueryDto);
  }

  @Post('read-all')
  async readAllNotifications(@GetUser() user: AuthUser) {
    await this.notificationService.readAllNotifications(user);
  }

  @Post('/send-onesignal-notification')
  sendOneSignalNotification(@Body() body: SendOneSignalNotificationDto) {
    return this.notificationService.sendOneSignalNotification(body);
  }
}
