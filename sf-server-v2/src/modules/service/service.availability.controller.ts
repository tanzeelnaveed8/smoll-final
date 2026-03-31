import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/decorators/role.decorator';
import { RoleGuard } from 'src/guards/role/role.guard';
import { RolesEnum } from 'src/guards/role/role.enum';
import { IsOptional, IsString, Matches } from 'class-validator';

/** Query DTO for availability (date YYYY-MM-DD) */
export class HomeServiceAvailabilityQueryDto {
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'date must be YYYY-MM-DD',
  })
  date?: string;
}

/**
 * Returns available time slots for home service booking.
 * App expects: { slots: string[] } or { data: string[] }
 * Default slots 09:00–17:00 in 1h steps; can be replaced by real scheduling later.
 */
const DEFAULT_SLOTS = [
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '01:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
  '05:00 PM',
];

@ApiTags('Service: Home Services Availability')
@Controller('/member/home-services')
@ApiBearerAuth()
@UseGuards(AuthGuard(), RoleGuard)
@Roles([RolesEnum.MEMBER])
export class ServiceAvailabilityController {
  @Get('availability')
  getAvailability(
    @Query() query: HomeServiceAvailabilityQueryDto,
  ): { slots: string[] } {
    // TODO: integrate with real scheduling by date (query.date)
    return { slots: DEFAULT_SLOTS };
  }
}
