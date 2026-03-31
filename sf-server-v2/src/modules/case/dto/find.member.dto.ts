import { Expose, Transform, Type } from 'class-transformer';
import { FindFileResDto } from '../../../modules/file/dto/find.dto';
import { CaseStatusEnum } from '../enums/case-status.enum';
import { FindOnePetResDto } from '../../../modules/pet/dto/find.dto';
import { FindOneVetResDto } from '../../../modules/vet/dtos/find.dto';
import { ConsultationStatusEnum } from '../../../modules/vet/enums/consultation-status.enum';
import {
  FindPartnerResDto,
  FindPartnerServiceResDto,
} from '../../../modules/partner/dto/find.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../../utils/pagination';

export class FindAllCasesForMemberQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isEscalated?: boolean;
}

class FindAllCasesForMemberResDto_Pet {
  @Expose()
  name: string;

  @Expose()
  @Type(() => FindFileResDto)
  photos?: FindFileResDto[];
}

export class FindAllCasesForMemberResDto {
  @Expose()
  id: string;

  @Expose()
  @Type(() => FindAllCasesForMemberResDto_Pet)
  pet: FindAllCasesForMemberResDto_Pet;

  @Expose()
  @Transform(({ obj, value }) => obj.assignedVet?.name ?? value)
  vet: string;

  @Expose()
  status: CaseStatusEnum;

  @Expose()
  @Transform(
    ({ obj, value }) =>
      obj.partnerBooking?.scheduledAt ??
      obj.vetConsultation?.scheduledAt ??
      value,
  )
  scheduledAt?: Date;

  @Expose()
  @Transform(({ obj, value }) => {
    if (typeof obj.partnerBooking?.partner?.id !== 'undefined') {
      return obj.partnerBooking?.partner?.id;
    }

    return value;
  })
  hasPartnerBooking: string | null;

  @Expose()
  @Transform(({ obj, value }) => obj.vetConsultation?.status ?? value)
  consultationStatus?: ConsultationStatusEnum;

  @Expose()
  @Transform(({ obj, value }) => obj.vetConsultation?.id ?? value)
  consultationId?: string;

  @Expose()
  @Transform(({ obj, value }) => obj.partnerCosts?.length ?? value ?? 0)
  requestCount?: number;

  @Expose()
  @Transform(({ obj }) => {
    if (!obj.partnerCosts || obj.partnerCosts.length === 0) return false;
    return obj.partnerCosts.some((cost) => cost.isViewed === false);
  })
  hasNewQuotation?: boolean;

  @Expose()
  createdAt: Date;
}

export class FindOneCaseForMemberResDto {
  @Expose()
  id: string;

  @Expose()
  description: string;

  @Expose()
  assets: FindFileResDto[];

  @Expose()
  vetNote: string;

  @Expose()
  status: CaseStatusEnum;

  @Expose()
  isDirectEscalated: boolean;

  @Expose()
  isEmergency: boolean;

  @Expose()
  @Type(() => FindOnePetResDto)
  pet: FindOnePetResDto;

  @Expose()
  @Type(() => FindOneVetResDto)
  assignedVet: FindOneVetResDto;

  @Expose()
  @Transform(({ obj, value }) => obj.vetConsultation?.scheduledAt ?? value)
  scheduleAt: string;

  @Expose()
  createdAt: Date;
}

class FindQuotesForMemberResDto_Service extends FindPartnerServiceResDto {
  @Expose()
  label: string;
}

export class FindQuotesForMemberResDto {
  @Expose()
  id: string;

  @Expose()
  note: string;

  @Expose()
  services: FindQuotesForMemberResDto_Service[];

  @Expose()
  isEmergency: boolean;

  @Expose()
  isViewed: boolean;

  @Expose()
  isDirectEscalated: boolean;

  @Expose()
  meta: Record<string, string>;

  @Expose()
  @Transform(({ obj, value }) => obj.pet?.name ?? value)
  petName: string;

  @Expose()
  @Type(() => FindPartnerResDto)
  partner: FindPartnerResDto;
}
