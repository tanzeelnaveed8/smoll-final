import { Expose, Transform } from 'class-transformer';
import { FindPartnerResDto } from './find.dto';
import { PaginationQueryDto } from 'src/utils/pagination';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { FindFileResDto } from 'src/modules/file/dto/find.dto';

export class FindAllPartnerAdminQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @Transform(({ value }) => value === 'true')
  @IsOptional()
  @IsBoolean()
  isPending?: boolean;

  @Transform(({ value }) => value === 'true')
  @IsOptional()
  @IsBoolean()
  isSuspended?: boolean;
}

export class FindPartnerAdminResDto extends FindPartnerResDto {
  @Expose()
  isSuspended: boolean;

  @Expose()
  documents: FindFileResDto[];
}
