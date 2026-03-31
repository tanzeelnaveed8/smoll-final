import { Expose, Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { FindFileResDto } from '../../../modules/file/dto/find.dto';
import { PaginationQueryDto } from '../../../utils/pagination';
import { SubscriptionStatus } from 'src/modules/smollcare/enums/subscription-status.enum';
import { FindOnePetResDto } from 'src/modules/pet/dto/find.dto';
import { SubscriptionDto } from '../dtos/find.dto';

export class FindAllMemberQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;
}

export class FindAllMemberResDto {
  @Expose()
  id: string;

  @Expose()
  name: string | null;

  @Expose()
  phone: string | null;

  @Expose()
  isPhoneVerified: boolean;

  @Expose()
  email: string | null;

  @Expose()
  isEmailVerified: boolean;

  @Expose()
  profileImg: FindFileResDto | null;

  @Expose()
  address: string | null;

  @Expose()
  villa: string | null;

  @Expose()
  city: string | null;

  @Expose()
  country: string | null;

  @Expose()
  postalCode: string | null;

  @Expose()
  createdAt: Date;

  @Expose()
  petsCount?: number;

  @Expose()
  visitsCount?: number;

  @Expose()
  totalSpent?: number;

  @Expose()
  pets?: {
    name: string;
    breed?: string;
  }[];
}
export class FindSubscriptionDetails {
  @Expose()
  status: SubscriptionStatus.ACTIVE | SubscriptionStatus.CANCELED;

  @Expose()
  startDate: Date;

  @Expose()
  endDate: Date;
}

export class BenefitUsageHistoryDto {
  @Expose()
  partnerId: string | null;

  @Expose()
  clinicName: string;

  @Expose()
  note: string;

  @Expose()
  vet: string;

  @Expose()
  @Type(() => Date)
  createdAt: Date;
}

export class SmollCareBenefitUsageSummaryResDto {
  @Expose()
  serviceName: string;

  @Expose()
  date: Date;

  @Expose()
  petOwner: string;

  @Expose()
  membershipId: string;

  @Expose()
  vetName: string;

  @Expose()
  note: string | null;
}

export class BenefitUsageSummaryDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  totalUsageCount: number;

  @Expose()
  consumedUsageCount: number;

  @Expose()
  @Type(() => BenefitUsageHistoryDto)
  history: BenefitUsageHistoryDto[];
}

export class BenefitUsageFilterDto extends PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  month?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  year?: number;
}

export class FindOnePetForAdminResDto extends FindOnePetResDto {
  @Expose()
  @Type(() => FindSubscriptionDetails)
  subscriptionDetails: FindSubscriptionDetails;

  @Expose()
  @Type(() => BenefitUsageSummaryDto)
  benefitUsageSummary: BenefitUsageSummaryDto[];
}

export class FindOneMemberResDto extends FindAllMemberResDto {
  @Expose()
  careId: number | null;
  @Expose()
  @Type(() => FindOnePetForAdminResDto)
  pets: FindOnePetForAdminResDto[];
  @Expose()
  @Type(() => SubscriptionDto)
  subscription: SubscriptionDto | null;
}
