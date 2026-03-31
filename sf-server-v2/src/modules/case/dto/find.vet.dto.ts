import { Expose, Transform, Type } from 'class-transformer';
import { CaseStatusEnum } from '../enums/case-status.enum';
import { IsOptional, IsString } from 'class-validator';
import { FindOnePetResDto } from '../../../modules/pet/dto/find.dto';
import { FindFileResDto } from '../../../modules/file/dto/find.dto';
import { FindFeedbackResDto } from '../../../modules/vet/dtos/find.dto';
import { PaginationQueryDto } from '../../../utils/pagination';
import { FindPartnerQuoteResDto } from '../../../modules/partner/dto/find.dto';

export class FindAllCasesForVetQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;
}

class FindCasesBaseDto {
  @Expose()
  id: string;

  @Expose()
  description: string;

  @Expose()
  status: CaseStatusEnum;

  @Expose()
  @Transform(({ obj, value }) => obj.member?.name ?? value)
  member: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}

export class FindAllCasesForVetResDto extends FindCasesBaseDto {
  @Expose()
  @Transform(({ obj, value }) => obj.pet?.name ?? value)
  pet: string;
}

export class FindAllCasesForVetResDto__Quote__Partner {
  @Expose()
  name: string;

  @Expose()
  clinicImg: FindFileResDto;

  @Expose()
  isSelected: boolean;
}

export class FindAllCasesForVetResDto__Quote__Service {
  @Expose()
  isSelected: boolean;

  @Expose()
  name: string;

  @Expose()
  label: string;

  @Expose()
  price: number;

  @Expose()
  description: string;

  @Expose()
  id: string;
}

export class FindOneCaseForVetResDto__Quote extends FindPartnerQuoteResDto {
  @Expose()
  @Type(() => FindAllCasesForVetResDto__Quote__Service)
  // @ts-expect-error - overriding
  services: FindAllCasesForVetResDto__Quote__Service[];

  @Expose()
  @Type(() => FindAllCasesForVetResDto__Quote__Partner)
  partner: FindAllCasesForVetResDto__Quote__Partner;
}

export class FindOneCaseForVetResDto extends FindCasesBaseDto {
  @Expose()
  @Transform(({ obj, value }) => obj.member?.phone ?? value)
  memberPhone: string;

  @Expose()
  @Type(() => FindOnePetResDto)
  pet: FindOnePetResDto;

  @Expose()
  vetNote: string;

  @Expose()
  notes: Record<string, string>[];

  @Expose()
  @Type(() => FindFileResDto)
  assets: FindFileResDto[];

  @Expose()
  @Transform(({ obj, value }) => obj.vetFeedback ?? value ?? null)
  @Type(() => FindFeedbackResDto)
  feedback: FindFeedbackResDto;

  @Expose()
  @Type(() => FindOneCaseForVetResDto__Quote)
  quotes: FindOneCaseForVetResDto__Quote[];

  @Expose()
  serviceChecklist: { name: string; checked: boolean }[];

  @Expose()
  customerNotReachable: boolean;
}
