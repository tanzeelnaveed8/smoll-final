import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { OrgCodeResponseDto } from './org-code-response.dto';
import { FindFileResDto } from '../../file/dto/find.dto';

// Single organization response
export class OrganizationResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the organization',
    example: 'org_1234567890',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Name of the organization',
    example: 'Acme Corporation',
  })
  @Expose()
  organizationName: string;

  @ApiProperty({
    description: 'Domain of the organization',
    example: 'acme.com',
    nullable: true,
  })
  @Expose()
  domain: string | null;

  @ApiProperty({
    description: 'Contact details for the organization',
    example: '+971 44510090 | care@smoll.me',
    nullable: true,
  })
  @Expose()
  contactDetails: string | null;

  @ApiProperty({
    description: 'Profile image for the organization',
    nullable: true,
    type: () => FindFileResDto,
  })
  @Expose()
  @Type(() => FindFileResDto)
  profileImg: FindFileResDto | null;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  @Expose()
  updatedAt: Date;

  @ApiProperty({
    description: 'smollVet access start date',
    example: '2025-09-29',
    nullable: true,
  })
  @Expose()
  smollVetAccessStartDate: Date | null;

  @ApiProperty({
    description: 'smollVet access end date',
    example: '2026-09-28',
    nullable: true,
  })
  @Expose()
  smollVetAccessEndDate: Date | null;

  @ApiProperty({
    description: 'Is smollVet access currently active?',
    example: true,
  })
  @Expose()
  smollVetIsActive: boolean;

  @ApiProperty({
    description: 'Enable domain-based access',
    example: true,
  })
  @Expose()
  domainAccessEnabled: boolean;

  @ApiProperty({
    description: 'Enable code-based access',
    example: true,
  })
  @Expose()
  codeAccessEnabled: boolean;

  @ApiProperty({
    description: 'Enable domain group chat',
    example: true,
  })
  @Expose()
  domainGroupChatEnabled: boolean;

  @ApiProperty({
    description: 'Enable code group chat',
    example: true,
  })
  @Expose()
  codeGroupChatEnabled: boolean;

  @ApiProperty({
    description: 'Whether group chat is enabled for this organization',
    example: false,
  })
  @Expose()
  groupChatEnabled: boolean;

  @ApiProperty({
    description: 'List of generated organization codes',
    type: [OrgCodeResponseDto],
    required: false,
  })
  @Expose()
  @Type(() => OrgCodeResponseDto)
  codes?: OrgCodeResponseDto[];
}

// Minimal list item for admin organizations listing
export class OrganizationListItemDto {
  @ApiProperty({ description: 'Unique identifier of the organization' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'Name of the organization' })
  @Expose()
  organizationName: string;

  @ApiProperty({ description: 'Domain of the organization', nullable: true })
  @Expose()
  domain: string | null;

  @ApiProperty({ description: 'smollVet access start date', nullable: true })
  @Expose()
  smollVetAccessStartDate: Date | null;

  @ApiProperty({ description: 'smollVet access end date', nullable: true })
  @Expose()
  smollVetAccessEndDate: Date | null;

  @ApiProperty({ description: 'Whether smollVet is currently active' })
  @Expose()
  smollVetIsActive: boolean;

  @ApiProperty({
    description: 'Profile image',
    nullable: true,
    type: () => FindFileResDto,
  })
  @Expose()
  @Type(() => FindFileResDto)
  profileImg: FindFileResDto | null;
}

// List response for multiple organizations
export class OrganizationListResponseDto {
  @ApiProperty({
    description: 'List of organizations',
    type: [OrganizationResponseDto],
  })
  @Expose()
  organizations: OrganizationResponseDto[];

  @ApiProperty({
    description: 'Total count of organizations',
    example: 10,
  })
  @Expose()
  total: number;
}
