import { Transform } from 'class-transformer';
import { IsEmail, IsPhoneNumber, ValidateIf } from 'class-validator';

export class RegisterMemberDto {
  @ValidateIf((o) => !o.email && !o.phone?.includes('111111111'))
  @Transform(({ value }) =>
    typeof value === 'string' ? value.replace(/\s/g, '') : value,
  )
  @IsPhoneNumber(null, {
    message: 'Phone number must be valid',
  })
  phone?: string;

  @ValidateIf((o) => !o.phone)
  @IsEmail()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toLowerCase() : value,
  )
  email?: string;
}
