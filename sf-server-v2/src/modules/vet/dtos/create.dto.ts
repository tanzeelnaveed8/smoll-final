import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FindOneVetResDto } from './find.dto';

export class CreateFeedbackPayloadDto {
  @IsInt()
  rating: number;

  @IsString()
  @IsOptional()
  comment?: string;
}

export class CreateFeedbackQueryDto {
  @IsString()
  @IsNotEmpty()
  caseId: string;
}

export class TimeSlotDto {
  @ApiProperty({ example: '09:00', description: 'Start time in UTC' })
  @IsString()
  @IsNotEmpty()
  from: string;

  @ApiProperty({ example: '17:00', description: 'End time in UTC' })
  @IsString()
  @IsNotEmpty()
  to: string;
}

export class CreateAvailabilityDto {
  @ApiProperty({
    example: {
      mon: [{ from: '09:00', to: '17:00' }],
      tue: [{ from: '09:00', to: '17:00' }],
      wed: [{ from: '09:00', to: '17:00' }],
      thu: [{ from: '09:00', to: '17:00' }],
      fri: [{ from: '09:00', to: '17:00' }],
      sat: [{ from: '09:00', to: '17:00' }],
      sun: [{ from: '09:00', to: '17:00' }],
      '2024-01-01': [{ from: '09:00', to: '17:00' }],
    },
  })
  @IsNotEmpty()
  availability: {
    mon?: TimeSlotDto[];
    tue?: TimeSlotDto[];
    wed?: TimeSlotDto[];
    thu?: TimeSlotDto[];
    fri?: TimeSlotDto[];
    sat?: TimeSlotDto[];
    sun?: TimeSlotDto[];
    [date: string]: TimeSlotDto[] | undefined;
  };
}

export class ScheduleConsultationPayloadDto {
  @IsDateString()
  @IsNotEmpty()
  scheduleAt: Date;

  @IsString()
  @IsNotEmpty()
  caseId: string;

  @IsString()
  @IsNotEmpty()
  petId: string;
}

/* Responses */

export class CreateVetResDto extends FindOneVetResDto { }

export class CreateFeedbackResDto {
  @Expose()
  id: string;

  @Expose()
  rating: number;

  @Expose()
  comment?: string;

  @Expose()
  createdAt: string;
}

export class CreateRequestConsultaionPayloadDto {
  @Expose()
  @IsString()
  petId: string
}

export class AdminConsultationItemDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  price: number;
}

export class AdminCreateConsultationPayloadDto {
  @IsString()
  @IsNotEmpty()
  memberId: string;

  @IsString()
  @IsNotEmpty()
  petId: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsDateString()
  @IsOptional()
  scheduledAt?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AdminConsultationItemDto)
  @IsOptional()
  services?: AdminConsultationItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AdminConsultationItemDto)
  @IsOptional()
  products?: AdminConsultationItemDto[];
}
