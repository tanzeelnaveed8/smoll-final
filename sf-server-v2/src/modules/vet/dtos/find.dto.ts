import { Expose, Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
} from 'class-validator';
import { Type as CType } from 'class-transformer';
import { FindFileResDto } from '../../../modules/file/dto/find.dto';
import { ConsultationStatusEnum } from '../enums/consultation-status.enum';
import { FindOneCaseResDto } from '../../../modules/case/dto/find.dto';
import { FindOneMemberResDto } from '../../../modules/member/dtos/find.dto';
import { ConsultationTypeEnum } from '../enums/consultation-type.enum';
import { PaginationQueryDto } from '../../../utils/pagination';
import Test from 'supertest/lib/test';

export class SpecialityDto {
  @Expose()
  id: string;

  @Expose()
  name: string;
}
import { FindOnePetResDto } from 'src/modules/pet/dto/find.dto';

export class FindVetAvailabilityQueryDto {
  @IsDate()
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  date?: Date;
}

/** Response */

export class FindOneVetResDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  about: string | null;

  @Expose()
  phone: string;

  @Expose()
  designation: string | null;

  @Expose()
  email: string;

  @Expose()
  yearsOfExperience: number | null;

  @Expose()
  byAppointmentOnly: boolean;

  @Expose()
  @Type(() => SpecialityDto)
  @Transform(({ obj, value }) => obj.vetSpecialities?.map((vs: any) => vs.speciality) ?? value)
  specialities: SpecialityDto[];

  @Expose()
  profileImg: FindFileResDto | null;

  @Expose()
  address: string | null;

  @Expose()
  country: string | null;

  @Expose()
  @Type(() => FindAvailabilitiesResDto)
  availabilities: FindAvailabilitiesResDto[];

  @Expose()
  isOnline: boolean;

  @Expose()
  timeZone: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}

export class FindAllVetResDto extends FindOneVetResDto { }

class AvailabilityInterval {
  @Expose()
  from: string;

  @Expose()
  to: string;
}

export class FindAvailabilitiesResDto {
  @Expose()
  id: string;

  @Expose()
  dayOfWeek: number;

  @Expose()
  date: string;

  @Expose()
  @Type(() => AvailabilityInterval)
  intervals: AvailabilityInterval[];
}


export class FindMemberForVetResDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  profileImg: FindFileResDto | null;

  @Expose()
  email: string | null;

  @Expose()
  phone: string;

  @Expose()
  country: string | null;

  @Expose()
  city: string | null;

  @Expose()
  address: string | null;

  @Expose()
  pets: FindOnePetResDto[] | null;
}

export class FindConsultationsResDto {
  @Expose()
  id: string;

  @Expose()
  status: ConsultationStatusEnum;

  @Expose()
  scheduledAt: Date | null;

  @Expose()
  createdAt: Date;

  @Expose()
  rejectedByVetName: string | null;

  @Expose()
  acceptedAt: Date | null;
}

export class FindConsultationsForVetQueryDto extends PaginationQueryDto {
  @IsEnum(ConsultationTypeEnum)
  @IsOptional()
  type?: ConsultationTypeEnum;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isCompleted?: boolean;
}

export class FindConsultationCalendarQueryDto {
  @IsString()
  @IsNotEmpty()
  startDate: Date;

  @IsString()
  @IsOptional()
  type: 'weekly' | 'monthly';
}

/** Response */

export class FindConsultationsForVetResDto extends FindConsultationsResDto {
  @Expose()
  @Transform(({ obj, value }) =>
    obj.scheduledAt
      ? ConsultationTypeEnum.SCHEDULED
      : (ConsultationTypeEnum.INSTANT ?? value),
  )
  type: ConsultationTypeEnum;

  @Expose()
  @Transform(({ obj, value }) => obj.member.name ?? value)
  member: string;

  @Expose()
  @Transform(({ obj, value }) => obj.case?.description ?? value)
  caseBrief: string;

  @Expose()
  @Transform(({ obj, value }) => obj.case?.pet?.name ?? value)
  pet: string;
}

export class FindOneConsultationForVetResDto extends FindConsultationsResDto {
  @Expose()
  @Type(() => FindOneMemberResDto)
  member: FindOneMemberResDto;

  @Expose()
  @Type(() => FindOneCaseResDto)
  case: FindOneCaseResDto;
}

export class FindConsultationsForMemberResDto extends FindConsultationsResDto {
  @Expose()
  @Type(() => FindOneCaseResDto)
  case: FindOneCaseResDto;

  @Expose()
  @Type(() => FindOneMemberResDto)
  member?: FindOneMemberResDto;
}

export class FindOneConsultationResDto extends FindConsultationsResDto {
  @Expose()
  @Type(() => FindOneVetResDto)
  vet: FindOneVetResDto;
}

export class FindConsultationCalendarResDto {
  @Expose()
  consultations: FindConsultationsResDto[];

  @Expose()
  lastDate: string | null;
}

export class FindFeedbackResDto {
  @Expose()
  rating: number;

  @Expose()
  comment?: string;
}
