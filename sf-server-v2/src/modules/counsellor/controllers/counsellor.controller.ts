import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuthUser, GetUser } from 'src/decorators/get-user.decorator';
import { CounsellorSessionService } from '../services/counsellor.session.service';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/decorators/role.decorator';
import { RolesEnum } from 'src/guards/role/role.enum';
import { RoleGuard } from 'src/guards/role/role.guard';
import { plainToInstance } from 'class-transformer';
import {
  FindAllCounsellorSessionQueryDto,
  FindAllCounsellorSessionsResDto,
} from '../dtos/find.dto';

@ApiTags('Counsellor: Counsellor Role')
@ApiCookieAuth()
@Controller('/counsellors')
@UseGuards(AuthGuard(), RoleGuard)
@Roles([RolesEnum.COUNSELLOR])
export class CounsellorController {
  constructor(
    private readonly counsellorSessionService: CounsellorSessionService,
  ) {}

  @Get('/sessions')
  async findAllSessions(
    @GetUser() user: AuthUser,
    @Query() query: FindAllCounsellorSessionQueryDto,
  ): Promise<FindAllCounsellorSessionsResDto[]> {
    const sessions =
      await this.counsellorSessionService.findAllCounsellorSessions(
        user,
        query,
      );

    return plainToInstance(FindAllCounsellorSessionsResDto, sessions, {
      excludeExtraneousValues: true,
    });
  }

  @Post('/accept-session')
  acceptSession(
    @Query('sessionId') sessionId: string,
    @GetUser() user: AuthUser,
  ): Promise<void> {
    return this.counsellorSessionService.acceptSession(user, sessionId);
  }
}
