import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { FindOneCaseResDto } from './find.dto';
import { FindFileResDto } from 'src/modules/file/dto/find.dto';
import { CaseStatusEnum } from '../enums/case-status.enum';
import { CaseQuoteLabel } from '../enums/case-quote-label.enum';
import { Type } from 'class-transformer';

export class CreateCaseQueryDto {
  @IsString()
  @IsNotEmpty()
  petId: string;

  @IsString()
  @IsNotEmpty()
  vetId: string;
}

export class CreateCasePayloadDto {
  @IsEnum([CaseStatusEnum.PENDING])
  @IsOptional()
  status: CaseStatusEnum;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsArray()
  @IsOptional()
  assets: FindFileResDto[];
}

export class AddNotePayloadDto {
  @IsArray()
  @IsObject({ each: true })
  @IsNotEmpty()
  notes: Record<string, string>[];
}

export class EscalatePayloadDto {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  partnerIds: string[];

  @IsString()
  @IsOptional()
  vetNote: string;
}

export class DirectEscalatePayloadDto {
  @IsString()
  @IsNotEmpty()
  partnerId: string;

  @IsString()
  @IsOptional()
  vetNote: string;

  @IsArray()
  @Type(() => ServiceDto)
  services: ServiceDto[];

  @IsString()
  @IsOptional()
  partnerVetId: string;

  @IsDateString()
  @IsOptional()
  scheduledAt: Date;

  @IsBoolean()
  @IsOptional()
  isEmergency: boolean;
}

export class CreateCaseResDto extends FindOneCaseResDto {}

export class ServiceDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  label: CaseQuoteLabel;
}

export class CreateCaseQuotePayloadDto {
  @IsArray()
  @Type(() => ServiceDto)
  services: ServiceDto[];

  @IsString()
  @IsNotEmpty()
  note: string;

  @IsObject()
  @IsOptional()
  meta?: {
    partnerVetId?: string;
    scheduledAt?: Date;
  };
}

export class CloseCasePayloadDto {
  @IsString()
  @IsNotEmpty()
  note: string;
}
