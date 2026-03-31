import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsTimeZone,
} from 'class-validator';
import { FindOneCounsellorResDto } from './find.dto';

export class CreateCounsellorPayloadDto {
  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  designation: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsTimeZone()
  @IsNotEmpty()
  timeZone: string;
}

export class CreateCounsellorResDto extends FindOneCounsellorResDto {}
