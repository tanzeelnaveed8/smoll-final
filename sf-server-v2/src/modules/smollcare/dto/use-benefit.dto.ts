import { Expose, Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class Benefits {
  @IsInt()
  @Expose()
  benefitId: number;

  @IsOptional()
  @Expose()
  note: string;

  @IsString()
  @Expose()
  vet: string;
}

export class UseBenefitDto {
  @IsString()
  @Expose()
  petId: string;

  @IsOptional()
  @Expose()
  caseId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Benefits)
  @Expose()
  benefits: Benefits[];
}
