import { IsEmail, IsOptional, IsPhoneNumber, IsString, IsTimeZone } from 'class-validator';

export class UpdateCounsellorPayloadDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsPhoneNumber()
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  designation?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsTimeZone()
  @IsOptional()
  timeZone?: string;
}
