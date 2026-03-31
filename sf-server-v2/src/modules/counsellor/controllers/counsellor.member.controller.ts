import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { Roles } from 'src/decorators/role.decorator';
import { RoleGuard } from 'src/guards/role/role.guard';
import { RolesEnum } from '../../../guards/role/role.enum';

import { AuthUser, GetUser } from 'src/decorators/get-user.decorator';
import { CounsellorService } from '../services/counsellor.service';
import {
  FindAllCounsellorsResDto,
  FindAllSessionsQueryDto,
  FindAllSessionsResDto,
} from '../dtos/find.dto';
import { CounsellorSessionService } from '../services/counsellor.session.service';
import { CounsellorSessionStatus } from '../session-status.enum';

@ApiTags('Counsellor: Member Role')
@ApiCookieAuth()
@Controller('/member/counsellors')
@UseGuards(AuthGuard(), RoleGuard)
@Roles([RolesEnum.MEMBER])
export class CounsellorMemberController {
  constructor(
    private readonly counsellorService: CounsellorService,
    private readonly counsellorSessionService: CounsellorSessionService,
  ) {}

  @Get()
  async findAll(): Promise<FindAllCounsellorsResDto[]> {
    const counsellors = await this.counsellorService.findAll();

    return plainToInstance(FindAllCounsellorsResDto, counsellors, {
      excludeExtraneousValues: true,
    });
  }

  @Get('/sessions')
  async findAllSessions(
    @GetUser() user: AuthUser,
    @Query() query: FindAllSessionsQueryDto,
  ): Promise<FindAllSessionsResDto[]> {
    const sessions = await this.counsellorSessionService.findAll(user, query);

    return plainToInstance(FindAllSessionsResDto, sessions, {
      excludeExtraneousValues: true,
    });
  }

  @Post('/request-session')
  requestSession(@GetUser() user: AuthUser): Promise<void> {
    return this.counsellorSessionService.requestSession(user);
  }
}
