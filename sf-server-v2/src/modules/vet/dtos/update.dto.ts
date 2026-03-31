import { OmitType, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { FindFileResDto } from '../../../modules/file/dto/find.dto';
import { Type } from 'class-transformer';
import { FindOneVetResDto } from './find.dto';
import { CreateVetPayloadDto } from './create.admin.dto';

export class UpdateVetPayloadDto extends PartialType(
  OmitType(CreateVetPayloadDto, [
    'phone',
    'email',
    'profileImg',
    'dob',
    'documents',
  ]),
) {
  @IsString()
  @IsOptional()
  oldPassword?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsNumber()
  @IsOptional()
  yearsOfExperience?: number;

  @IsOptional()
  @Type(() => FindFileResDto)
  profileImg?: FindFileResDto;

  @IsBoolean()
  @IsOptional()
  isOnline?: boolean;
}

export class UpdateConsultationPayloadDto {
  @IsNotEmpty()
  @IsString()
  caseId: string;
}

export class UpdateVetResDto extends FindOneVetResDto {}
