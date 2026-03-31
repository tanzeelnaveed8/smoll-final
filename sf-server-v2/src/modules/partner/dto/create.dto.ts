import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';
import {
  FindOnePartnerVetResDto,
  FindPartnerResDto,
  FindPartnerServiceResDto,
} from './find.dto';
import { Type } from 'class-transformer';
import { FindFileResDto } from '../../../modules/file/dto/find.dto';
import { CreateAvailabilityDto } from '../../../modules/vet/dtos/create.dto';
import { ServiceDto } from '../../../modules/case/dto/create.dto';

export class CreatePartnerVetPayloadDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  about?: string;

  @IsString()
  @IsOptional()
  labelColor: string;

  @IsPhoneNumber()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional()
  email: string;

  @IsString()
  @IsOptional()
  designation: string;

  @IsNumber()
  @IsOptional()
  yearsOfExperience: number;

  @IsOptional()
  @Type(() => FindFileResDto)
  profileImg: FindFileResDto;

  @Type(() => CreateAvailabilityDto)
  @IsOptional()
  availabilities: CreateAvailabilityDto;
}

export class CreatePartnerServicePayloadDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsBoolean()
  @IsOptional()
  quickBooking: boolean;
}

export class BookAppointmentPayloadDto {
  @IsString()
  @IsOptional()
  bookingId?: string;

  @IsDateString()
  @IsNotEmpty()
  scheduleAt: Date;

  @IsString()
  @IsNotEmpty()
  caseId: string;

  @IsString()
  @IsOptional()
  paymentIntentId: string;

  @IsArray()
  @Type(() => ServiceDto)
  services: ServiceDto[];
}

export class BookEmergencyAppointmentPayloadDto {
  @IsDateString()
  @IsNotEmpty()
  scheduleAt: Date;

  @IsString()
  @IsNotEmpty()
  caseId: string;

  @IsString()
  @IsOptional()
  paymentIntentId: string;

  @IsArray()
  @Type(() => ServiceDto)
  services: ServiceDto[];
}

/** Responses */

export class CreatePartnerResDto extends FindPartnerResDto {}
export class CreatePartnerVetResDto extends FindOnePartnerVetResDto {}
export class CreatePartnerServiceResDto extends FindPartnerServiceResDto {}
