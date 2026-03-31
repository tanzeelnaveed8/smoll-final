import { OmitType } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { FindFileResDto } from '../../../modules/file/dto/find.dto';
import { FindPartnerQuoteResDto } from '../../../modules/partner/dto/find.dto';
import { FindOnePetResDto } from '../../../modules/pet/dto/find.dto';
import { PaginationQueryDto } from '../../../utils/pagination';
import { FindAllCasesForVetResDto__Quote__Service } from './find.vet.dto';

export class FindAllCasesForPartnerQueryDto extends PaginationQueryDto {
  @IsString()
  @IsOptional()
  search?: string;
}

export class FindAllCasesForPartnerResDto {
  @Expose()
  id: string;

  @Expose()
  @Transform(({ obj, value }) => obj.member?.name ?? value)
  member: string;

  @Transform(({ obj, value }) => obj.pet?.name ?? value)
  @Expose()
  pet: string;

  @Expose()
  @Transform(({ obj, value }) => obj.assignedVet?.name ?? value)
  vet: string;

  @Expose()
  quoteExists: boolean;

  @Expose()
  @Transform(
    ({ obj, value }) => obj.partnerBooking?.partner?.id ?? value ?? null,
  )
  partnerBookingId: string | null;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}

export class FindOneCaseForPartnerResDto__Quote extends FindPartnerQuoteResDto {
  @Expose()
  @Type(() => FindAllCasesForVetResDto__Quote__Service)
  // @ts-expect-error - overriding
  services: FindAllCasesForVetResDto__Quote__Service[];
}
export class FindOneCaseForPartnerResDto extends OmitType(
  FindAllCasesForPartnerResDto,
  ['pet'],
) {
  @Expose()
  @Transform(({ obj, value }) => obj.member?.phone ?? value)
  memberPhone: string;

  @Expose()
  @Type(() => FindOnePetResDto)
  pet: FindOnePetResDto;

  @Expose()
  description: string;

  @Expose()
  vetNote: string;

  @Expose()
  isEmergency: boolean;

  @Expose()
  @Type(() => FindFileResDto)
  assets: FindFileResDto[];

  @Expose()
  @Transform(({ obj, value }) => obj.partnerBooking?.vet?.name ?? value)
  partnerBookingVet: string;

  // TODO: change later
  @Expose()
  @Type(() => FindOneCaseForPartnerResDto__Quote)
  quote: FindOneCaseForPartnerResDto__Quote[];
}
