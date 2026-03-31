import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';
import { FindFileResDto } from '../../../modules/file/dto/find.dto';

export class CreatePartnerPayloadDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  receptionistName: string;

  @IsPhoneNumber()
  @IsNotEmpty()
  phone: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @Type(() => FindFileResDto)
  clinicImg?: FindFileResDto;

  @IsOptional()
  @Type(() => FindFileResDto)
  imgCollections?: FindFileResDto[];

  @IsOptional()
  @Type(() => FindFileResDto)
  documents?: FindFileResDto[];

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  timeZone: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  specialities?: string[];
}
