import { ApiProperty } from '@nestjs/swagger';
import { LicenseStatus } from 'aws-sdk/clients/licensemanager';
import { SubscriptionStatus } from 'aws-sdk/clients/sesv2';
import { Expose, Type } from 'class-transformer';
import { IsArray, IsString, IsUUID } from 'class-validator';

export class FindPartnerForPartnerResDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  receptionistName: string;
}

export class SmollCareBenefits {
  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  maxUsagePerSubscription: number;
}

export class SmollCareBenefitResDto {
  @Expose()
  @Type(() => SmollCareBenefits)
  benefits: SmollCareBenefits[];

  @Expose()
  price: number;
}

export class UsageBenefits {
  @Expose()
  benefitId: number;

  @Expose()
  note: string;
}

export class SmollCareBenefitUsageResDto {
  @Expose()
  message: string;

  @Expose()
  @IsArray()
  @Type(() => UsageBenefits)
  savedUsages: UsageBenefits[];

  @Expose()
  @IsArray()
  errors: [];
}

export class AssignLicenseResponseDto {
  @Expose()
  petId: string;

  @Expose()
  assignedAt: Date;

  @Expose()
  status: LicenseStatus;

  @Expose()
  charge: number;
}

export class SmollCareSubscriptionForResDto {
  @Expose()
  @IsUUID()
  id: string;

  @Expose()
  status: SubscriptionStatus;

  @Expose()
  @IsUUID()
  planId: string;

  @Expose()
  totalLicences: number;
}

export class SmollCarePlanResDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  price: number;

  @Expose()
  defaultLicenses: number;

  @Expose()
  extraLicensePrice: number;
}
export class FindBenefitsQueryDto {
  @ApiProperty()
  @IsString()
  petId?: string;
}

export class VerifyCodePayloadDto {
  @Expose()
  @IsString()
  code: string;
}
