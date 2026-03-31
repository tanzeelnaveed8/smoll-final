import { Expose, Transform, Type } from 'class-transformer';
import { CounsellorSessionStatus } from '../session-status.enum';
import { FindOneMemberResDto } from 'src/modules/member/dtos/find.dto';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from 'src/utils/pagination';

export class FindAllCounsellorSessionQueryDto {
  @IsEnum(CounsellorSessionStatus)
  status: CounsellorSessionStatus;
}

export class FindAllSessionsQueryDto {
  @IsEnum(CounsellorSessionStatus)
  status: CounsellorSessionStatus;
}

/** Response */

export class FindAllCounsellorsQueryDto extends PaginationQueryDto {
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isSuspended?: boolean;

  @IsString()
  @IsOptional()
  search?: string;
}

export class FindOneCounsellorResDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  phone: string;

  @Expose()
  email: string | null;

  @Expose()
  designation: string | null;

  @Expose()
  address: string | null;

  @Expose()
  country: string | null;

  @Expose()
  isOnline: boolean;

  @Expose()
  isSuspended: boolean;

  @Expose()
  timeZone: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}

export class FindAllCounsellorsResDto extends FindOneCounsellorResDto {}

export class FindAllSessionsResDto {
  @Expose()
  id: string;

  @Expose()
  @Transform(({ obj, value }) => obj.counsellor?.id ?? value)
  counsellorId?: string;

  @Expose()
  @Transform(({ obj, value }) => obj.counsellor?.name ?? value)
  name?: string;

  @Expose()
  @Transform(({ obj, value }) => obj.counsellor?.designation ?? value)
  designation?: string;
}

export class FindAllCounsellorSessionsResDto {
  @Expose()
  id: string;

  @Expose()
  status: CounsellorSessionStatus;

  @Expose()
  @Type(() => FindOneMemberResDto)
  member: FindOneMemberResDto;
}
