import {
  IsOptional,
  IsString,
  MaxLength,
  Matches,
  IsBoolean,
  IsDateString,
  ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class UpdateOrganizationDto {
  @ApiProperty({
    description: 'Name of the organization',
    example: 'Acme Corporation Updated',
    maxLength: 255,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Organization name must be a string' })
  @MaxLength(255, {
    message: 'Organization name must not exceed 255 characters',
  })
  organizationName?: string;

  @ApiProperty({
    description: 'Domain of the organization (must be unique)',
    example: 'acme-updated.com',
    maxLength: 255,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Domain must be a string' })
  @MaxLength(255, {
    message: 'Domain must not exceed 255 characters',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toLowerCase() : value,
  )
  @ValidateIf((_, value) => value !== '')
  @Matches(
    /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])*$/,
    { message: 'Domain must be a valid domain format' },
  )
  domain?: string;

  @ApiProperty({
    description: 'Contact details for the organization',
    example: '+971 44510090 | care@smoll.me',
    maxLength: 255,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Contact details must be a string' })
  @MaxLength(255, {
    message: 'Contact details must not exceed 255 characters',
  })
  contactDetails?: string;

  @ApiProperty({
    description:
      'Whether to grant or revoke smollVet access (365 days from now)',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  smollVetAccess?: boolean;

  @ApiProperty({
    description: 'Enable or disable domain-based access',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  domainAccessEnabled?: boolean;

  @ApiProperty({
    description: 'Enable or disable code-based access',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  codeAccessEnabled?: boolean;

  @ApiProperty({
    description: 'Enable or disable group chat feature',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  groupChatEnabled?: boolean;

  @ApiProperty({
    description: 'Enable or disable domain group chat',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  domainGroupChatEnabled?: boolean;

  @ApiProperty({
    description: 'Enable or disable code group chat',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  codeGroupChatEnabled?: boolean;

  @ApiProperty({
    description: 'Start date for smollVet access (ISO 8601 format)',
    example: '2024-01-01',
    required: false,
  })
  @IsOptional()
  @ValidateIf((_, value) => value !== '')
  @IsDateString()
  smollVetAccessStartDate?: string;

  @ApiProperty({
    description: 'End date for smollVet access (ISO 8601 format)',
    example: '2025-01-01',
    required: false,
  })
  @IsOptional()
  @ValidateIf((_, value) => value !== '')
  @IsDateString()
  smollVetAccessEndDate?: string;

  @ApiProperty({
    description: 'Whether smollVet access is currently active',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  smollVetIsActive?: boolean;
}
