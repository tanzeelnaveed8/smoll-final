import { PartialType } from '@nestjs/mapped-types';
import {
  CreatePartnerServicePayloadDto,
  CreatePartnerVetPayloadDto,
} from './create.dto';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { OmitType } from '@nestjs/swagger';
import {
  FindOnePartnerVetResDto,
  FindPartnerResDto,
  FindPartnerServiceResDto,
} from './find.dto';
import { CreatePartnerPayloadDto } from './create.admin.dto';

export class UpdatePartnerPayloadDto extends OmitType(
  PartialType(CreatePartnerPayloadDto),
  ['email'],
) {
  @IsString()
  @IsOptional()
  oldPassword?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsOptional()
  @IsString()
  openingHours?: string;
}

export class UpdatePartnerVetPayloadDto extends PartialType(
  CreatePartnerVetPayloadDto,
) {
  @IsBoolean()
  @IsOptional()
  isSuspended?: boolean;
}

export class UpdatePartnerServicePayloadDto extends PartialType(
  CreatePartnerServicePayloadDto,
) {}

/** Response */
export class UpdatePartnerResDto extends FindPartnerResDto {}
export class UpdatePartnerServiceResDto extends FindPartnerServiceResDto {}
export class UpdatePartnerVetResDto extends FindOnePartnerVetResDto {}
