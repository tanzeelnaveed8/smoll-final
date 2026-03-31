import { Expose, Transform, Type } from 'class-transformer';
import { FindFileResDto } from '../../../modules/file/dto/find.dto';
import { FindAvailabilitiesResDto } from '../../../modules/vet/dtos/find.dto';
import { FindPartnerResDto, FindPartnerSpecialityResDto } from './find.dto';
import { FindOnePetResDto } from '../../../modules/pet/dto/find.dto';
import { FindOneCaseForMemberResDto } from '../../../modules/case/dto/find.member.dto';

export class FindAllPartnerVetsForMemberDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  about: string | null;

  @Expose()
  designation: string;

  @Expose()
  yearsOfExperience: number;

  @Expose()
  @Type(() => FindFileResDto)
  profileImg: FindFileResDto;
}

export class FindOnePartnerForMemberDto extends FindPartnerResDto {
  @Expose()
  @Type(() => FindAllPartnerVetsForMemberDto)
  vets: FindAllPartnerVetsForMemberDto;
}

export class FindPartnerForMemberResDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  clinicImg: FindFileResDto | null;

  @Expose()
  city: string;
}

export class FindOnePartnerVetForMemberDto extends FindAllPartnerVetsForMemberDto {
  @Expose()
  @Type(() => FindAvailabilitiesResDto)
  availabilities: FindAvailabilitiesResDto;

  @Expose()
  @Transform(({ obj, value }) => obj.partner?.name ?? value)
  partnerName: string;

  @Expose()
  @Transform(({ obj, value }) => obj.partner?.address ?? value)
  partnerAddress: string;
}

export class FindAllAppointmentsForMemberDto {
  @Expose()
  id: string;

  @Expose()
  scheduledAt: Date;

  @Expose()
  @Type(() => FindPartnerResDto)
  partner: FindPartnerResDto;

  @Expose()
  @Type(() => FindOnePartnerVetForMemberDto)
  vet: FindOnePartnerVetForMemberDto;

  @Expose()
  @Type(() => FindOnePetResDto)
  @Transform(({ obj, value }) => obj.case?.pet ?? value)
  pet: FindOnePetResDto;
}

export class FindOneAppointmentForMemberVetDto_Services {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  price: number;

  @Expose()
  label: string;
}

export class FindOneAppointmentForMemberDto extends FindAllAppointmentsForMemberDto {
  @Expose()
  @Type(() => FindOneCaseForMemberResDto)
  case: FindOneCaseForMemberResDto;

  @Expose()
  @Type(() => FindOneAppointmentForMemberVetDto_Services)
  services: FindOneAppointmentForMemberVetDto_Services[];

  @Expose()
  @Transform(({ obj, value }) => obj.case?.isEmergency ?? value ?? false)
  isEmergency: boolean;
}
