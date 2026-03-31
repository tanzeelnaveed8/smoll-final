import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  MaxLength,
  Matches,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateOrganizationDto {
  @ApiProperty({
    description: 'Name of the organization',
    example: 'Acme Corporation',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'Organization name is required' })
  @IsString({ message: 'Organization name must be a string' })
  @MaxLength(255, {
    message: 'Organization name must not exceed 255 characters',
  })
  organizationName: string;

  @ApiProperty({
    description: 'Domain of the organization (must be unique)',
    example: 'acme.com',
    maxLength: 255,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Domain must be a string' })
  @MaxLength(255, { message: 'Domain must not exceed 255 characters' })
  @Matches(
    /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])*$/,
    { message: 'Domain must be a valid domain format' },
  )
  @Transform(({ value }) => (value ? value.toLowerCase() : value))
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
    description: 'Whether to grant smollVet access immediately (365 days)',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  smollVetAccess?: boolean;

  @ApiProperty({
    description: 'Enable domain-based access',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  domainAccessEnabled?: boolean;

  @ApiProperty({
    description: 'Enable code-based access',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  codeAccessEnabled?: boolean;

  @ApiProperty({
    description: 'Enable domain group chat for this organization',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  domainGroupChatEnabled?: boolean;

  @ApiProperty({
    description: 'Enable code group chat for this organization',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  codeGroupChatEnabled?: boolean;

  @ApiProperty({
    description:
      'Optional start date for smollVet access (ISO 8601). If omitted, the current date is used.',
    example: '2023-06-01',
    required: false,
  })
  @IsOptional()
  @IsString()
  smollVetAccessStartDate?: string;

  @ApiProperty({
    description:
      'Optional end date for smollVet access (ISO 8601). If omitted, calculated from start date + 365 days.',
    example: '2024-06-01',
    required: false,
  })
  @IsOptional()
  @IsString()
  smollVetAccessEndDate?: string;

  // --- NEW FIELD: number of codes to generate ---
  @ApiProperty({
    description: 'Number of OrgCodes to generate for this organization',
    example: 5,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'Number of codes must be an integer' })
  @Min(0, { message: 'Number of codes must be at least 0' })
  @Max(100, { message: 'Number of codes cannot exceed 100' })
  numberOfCodes?: number;
}

export class AddCodesDto {
  @ApiProperty({
    description: 'Number of codes to add to the organization',
    example: 10,
    minimum: 1,
    maximum: 1000,
    type: 'integer',
  })
  @IsNotEmpty({ message: 'Number of codes is required' })
  @IsInt({ message: 'Number of codes must be an integer' })
  @Min(1, { message: 'Must add at least 1 code' })
  @Max(1000, { message: 'Cannot add more than 1000 codes at once' })
  numberOfCodes: number;

  @ApiProperty({
    description:
      'Maximum validity duration in months from activation date for new codes. Null means unlimited.',
    example: 12,
    required: false,
    minimum: 1,
    maximum: 24,
    type: 'integer',
  })
  @IsOptional()
  @IsInt({ message: 'maxUsageMonths must be an integer' })
  @Min(1, { message: 'maxUsageMonths must be at least 1' })
  @Max(24, { message: 'maxUsageMonths must be at most 24' })
  maxUsageMonths?: number | null;
}
