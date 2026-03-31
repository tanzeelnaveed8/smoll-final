import { Expose, Transform, Type } from 'class-transformer';
import { IsArray, IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';
import { FindOneVetResDto } from './find.dto';
import { PaginationQueryDto } from '../../../utils/pagination';
import { FindFileResDto } from '../../../modules/file/dto/find.dto';

export class FindAllVetQueryDto extends PaginationQueryDto {
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isSuspended?: boolean;

  @IsString()
  @IsOptional()
  search?: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  byAppointmentOnly?: boolean;

  @IsArray()
  // @IsUUID('all', { each: true })
  // @IsString({ each: true })
  @IsOptional()
  specialityIds?: string[];
}

export class FindAllVetAdminResDto extends FindOneVetResDto {
  @Expose()
  avgRating: number;

  @Expose()
  isSuspended: boolean;
}

export class FindOneVetAdminResDto extends FindOneVetResDto {
  @Expose()
  @Type(() => FindFileResDto)
  documents: FindFileResDto[] | null;

  @Expose()
  isSuspended: boolean;
  @Expose()
  dob: Date;
}
