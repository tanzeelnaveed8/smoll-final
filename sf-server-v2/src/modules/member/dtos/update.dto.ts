import { IsBoolean, IsEmail, IsOptional, IsPhoneNumber, IsString } from 'class-validator';
import { ApiHideProperty } from '@nestjs/swagger';
import { Exclude, Transform, Type } from 'class-transformer';
import { FindOneMemberResDto } from './find.dto';
import { FindFileResDto } from '../../../modules/file/dto/find.dto';

export class UpdateMemberPayloadDto {
  @IsString()
  @IsOptional()
  playerId?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toLowerCase() : value,
  )
  email?: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.replace(/\s/g, '') : value,
  )
  @IsPhoneNumber(null, {
    message: 'Phone number must be valid',
  })
  @IsOptional()
  phone?: string;

  @IsOptional()
  @Type(() => FindFileResDto)
  profileImg?: FindFileResDto;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  villa?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  timeZone?: string;

  @IsString()
  @IsOptional()
  postalCode?: string;

  @IsBoolean()
  @IsOptional()
  @ApiHideProperty()
  @Exclude()
  isEmailVerified?: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiHideProperty()
  @Exclude()
  isPhoneVerified?: boolean;
}

export class UpdateMemberResDto extends FindOneMemberResDto {}
