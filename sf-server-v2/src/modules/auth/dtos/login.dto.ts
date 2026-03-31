import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { RegisterMemberDto } from './register.dto';
import { RolesEnum } from 'src/guards/role/role.enum';
import { Transform } from 'class-transformer';

export class LoginByPhoneDto extends RegisterMemberDto {
  @IsOptional()
  @IsString()
  @Length(6, 6)
  @Matches(/^[0-9A-Z]+$/)
  orgCode?: string;
}
export class LoginByEmailDto {
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toLowerCase() : value,
  )
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

// DTO for impersonation request
export class ImpersonateLoginDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsEnum(RolesEnum)
  @IsNotEmpty()
  role: RolesEnum;
}

// DTO for mastermind login
export class MastermindLoginDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
