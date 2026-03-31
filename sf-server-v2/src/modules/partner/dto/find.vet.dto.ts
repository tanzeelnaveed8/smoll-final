import { Expose, Transform, Type } from 'class-transformer';
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';
import { FindFileResDto } from '../../../modules/file/dto/find.dto';
import { PaginationQueryDto } from '../../../utils/pagination';

export class FindAllPartnersForVetQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialities?: string[];

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  quickList?: boolean;
}

export class FindAllServicesForVetQueryDto {
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  quickList?: boolean;
}

class FindAllPartnersForVetResDto__Vet {
  @Expose()
  id: string;

  @Expose()
  name: string;
}

export class FindAllPartnersForVetResDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  @Type(() => FindFileResDto)
  clinicImg: FindFileResDto;

  @Expose()
  country: string;

  @Expose()
  city: string;

  @Expose()
  address: string;

  @Expose()
  @Type(() => FindAllPartnersForVetResDto__Vet)
  vets: FindAllPartnersForVetResDto__Vet[];
}
