import { Expose, Transform, Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { FindFileResDto } from '../../../modules/file/dto/find.dto';

export class MemberNavNotifDto {
  @Expose()
  newQuotation: number;
}

export class MemberPopupsDto {
  @Expose()
  emergency: {
    caseId: string;
    partnerId: string;
    hasPartnerBooking: boolean;
  } | null;
}

export enum SubscriptionPlanType {
  SMOLL_BASIC = 'smollBasic',
  SMOLL_VET = 'smollVet',
  SMOLL_CARE = 'smollCare',
}

export class GroupChatInfoDto {
  @Expose()
  id: string;

  @Expose()
  loginMethod: 'domain' | 'code';

  @Expose()
  isEnabled: boolean;
}

export class SubscriptionDto {
  @Expose()
  type: SubscriptionPlanType;

  @Expose()
  validUntil: Date | null;

  @Expose()
  isActive: boolean;

  @Expose()
  organizationName: string | null;

  @Expose()
  organizationId: string | null;

  @Expose()
  @Type(() => FindFileResDto)
  organizationProfileImg: FindFileResDto | null;

  @Expose()
  @Type(() => GroupChatInfoDto)
  groupChat: GroupChatInfoDto | null;
}

export class FindOneMemberResDto {
  @Expose()
  id: string;

  @Expose()
  playerId: string | null;

  @Expose()
  name: string;

  @Expose()
  phone: string;

  @Expose()
  stripeCustomerId: string;

  @Expose()
  email: string | null;

  @Expose()
  careId: number;

  @Transform(({ obj, value }) => {
    if (obj.pets) {
      return obj.pets.length;
    }
    return value;
  })
  @Expose()
  petCount: number;

  @Expose()
  navNotif: MemberNavNotifDto;

  @Expose()
  popups: MemberPopupsDto;

  @Expose()
  subscription: SubscriptionDto;

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
  timeZone: string | null;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}

export class PetSummaryDto {
  @Expose()
  name: string;

  @Expose()
  isDeceased: boolean;

  @Expose()
  dob: Date | null;

  @Expose()
  breed: string | null;

  @Expose()
  careId: number | null;

  @Expose()
  photos: FindFileResDto[];

  @Expose()
  @Transform(({ obj }) =>
    obj.photos && obj.photos.length > 0 ? obj.photos[0] : null,
  )
  profileImg: FindFileResDto | null;
}

export class MemberPublicProfileResDto {
  @Expose()
  id: string;

  @Expose()
  name: string | null;

  @Expose()
  profileImg: FindFileResDto | null;

  @Expose()
  @Type(() => PetSummaryDto)
  pets: PetSummaryDto[];
}

export class MemberSummaryResDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  profileImg: FindFileResDto | null;
}

export class FindMembersByIdsQueryDto {
  @Expose()
  @IsOptional()
  @Transform(({ value, obj }) => {
    const raw = value ?? obj?.id ?? obj?.ids ?? null;
    if (Array.isArray(raw)) {
      return raw.map((v) => String(v).trim()).filter(Boolean);
    }
    if (typeof raw === 'string') {
      return raw
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean);
    }
    return [];
  })
  ids: string[];
}
