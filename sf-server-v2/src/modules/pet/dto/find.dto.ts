import { Expose, Transform, Type } from 'class-transformer';
import { PetSpeciesEnum } from '../pet-species.enum';
import { ApiProperty, PickType } from '@nestjs/swagger';
import { FindFileResDto } from '../../../modules/file/dto/find.dto';
import { PetGenderEnum } from '../enums/pet-gender.enum';
import { IsBoolean, IsDate, IsOptional, IsString } from 'class-validator';
import { SubscriptionStatus } from 'aws-sdk/clients/sesv2';

export class FindAllPetsQueryDto {
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isDeceased?: boolean;
}

export class BenefitHistoryDto {
  @Expose()
  partnerId: string;

  @Expose()
  clinicName: string;

  @Expose()
  note: string;

  @Expose()
  vet: string;

  @Expose()
  createdAt: Date;
}

export class PetBenefitDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  totalUsageCount: number;

  @Expose()
  consumedUsageCount: number;

  @Expose()
  @Type(() => BenefitHistoryDto)
  history: BenefitHistoryDto[];
}

export class FindOnePetResDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  age: number;

  @Expose()
  weight: number;

  @Expose()
  species: PetSpeciesEnum;

  @Expose()
  gender: PetGenderEnum;

  @Expose()
  spayedOrNeutered: boolean;

  @Expose()
  breed: string;

  @Expose()
  chipNumber: string | null;

  @Expose()
  dob: Date;

  @Expose()
  @Type(() => FindFileResDto)
  photos: FindFileResDto[];

  @Expose()
  isDeceased: boolean;

  @Expose()
  preExistingConditions: string | null;

  @Expose()
  careId: string | null;

  @Expose()
  @Type(() => FindOnePetHealthHistoryResDto)
  healthHistory: FindOnePetHealthHistoryResDto[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}

export class SubscriptionDto {
  @Expose()
  @IsString()
  status: string;

  @Expose()
  @IsDate()
  startDate: Date;

  @Expose()
  @IsDate()
  endDate: Date;
}

export class FindOnePetWithBenefitsResDto extends FindOnePetResDto {
  @Expose()
  @Type(() => SubscriptionDto)
  subscriptionDetails: SubscriptionDto;

  @Expose()
  @Type(() => PetBenefitDto)
  benefits: PetBenefitDto[];
}
export class FindAllPetsResDto extends PickType(FindOnePetResDto, [
  'id',
  'name',
  'photos',
  'isDeceased',
  'careId',
]) { }

export class FindOnePetHealthHistoryResDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  date: Date;

  @Expose()
  @Type(() => FindFileResDto)
  documents: FindFileResDto[];
}



export class SmollCareSubscriptionResDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  status: SubscriptionStatus

  @ApiProperty()
  @Expose()
  planId: string;
}

export class FindSmollCareLicence {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  @Type(() => SmollCareSubscriptionResDto)
  subscription: SmollCareSubscriptionResDto;
}

export class FindPetWithCareResDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  age: number;

  @ApiProperty()
  @Expose()
  weight: number;

  @ApiProperty()
  @Expose()
  species: PetSpeciesEnum;

  @ApiProperty()
  @Expose()
  gender: PetGenderEnum;

  @ApiProperty()
  @Expose()
  breed: string;

  @ApiProperty()
  @Type(() => FindSmollCareLicence)
  smollCareLicense: FindSmollCareLicence

}
