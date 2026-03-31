import { Expose, Transform, Type } from 'class-transformer';
import { CaseStatusEnum } from '../enums/case-status.enum';
import { PaginationQueryDto } from 'src/utils/pagination';
import { IsOptional, IsString } from 'class-validator';
import { FindOneMemberResDto } from 'src/modules/member/dtos/find.dto';
import { FindOnePetResDto } from 'src/modules/pet/dto/find.dto';
import { FindOneVetResDto } from 'src/modules/vet/dtos/find.dto';

export class FindAllCasesAdminQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;
}

export class FindAllCasesResDto {
  @Expose()
  id: string;

  @Transform(({ obj, value }) => obj.member?.name ?? value)
  @Expose()
  member: string;

  @Transform(({ obj, value }) => obj.pet?.name ?? value)
  @Expose()
  pet: string;

  @Transform(({ obj, value }) => obj.assignedVet?.name ?? value)
  @Expose()
  vet: string;

  @Expose()
  status: CaseStatusEnum;

  @Expose()
  createdAt: Date;

  @Expose()
  totalAmount: number;
}

export class FindOneCaseResDto {
  @Expose()
  id: string;

  @Expose()
  status: CaseStatusEnum;

  @Expose()
  description: string;

  @Expose()
  @Type(() => FindOneMemberResDto)
  member: FindOneMemberResDto;

  @Expose()
  @Type(() => FindOnePetResDto)
  pet: FindOnePetResDto;

  @Expose()
  @Type(() => FindOneVetResDto)
  assignedVet: FindOneVetResDto;

  @Expose()
  createdAt: Date;
}
