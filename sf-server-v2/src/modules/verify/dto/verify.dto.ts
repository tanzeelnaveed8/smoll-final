import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { RegisterMemberDto } from 'src/modules/auth/dtos/register.dto';

export class VerifyOtpDto extends RegisterMemberDto {
  @IsString()
  @Length(4, 4)
  @IsNotEmpty()
  otp: string;

  @IsOptional()
  @IsString()
  @Length(6, 6)
  @Matches(/^[0-9A-Z]+$/)
  orgCode?: string;
}

export class VerifyEmailDto {
  @IsString()
  @Length(4, 4)
  @IsNotEmpty()
  otp: string;
}

export class VerifyPhoneDto {
  @IsString()
  @Length(4, 4)
  @IsNotEmpty()
  otp: string;
}
