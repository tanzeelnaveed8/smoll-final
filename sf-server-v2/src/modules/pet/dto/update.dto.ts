import { PartialType } from '@nestjs/swagger';
import {
  CreatePetHealthHistoryPayloadDto,
  CreatePetPayloadDto,
} from './create.dto';
import { FindOnePetHealthHistoryResDto, FindOnePetResDto } from './find.dto';
import { IsBoolean, IsOptional } from 'class-validator';

// # Payload
export class UpdatePetPayloadDto extends PartialType(CreatePetPayloadDto) {
  @IsOptional()
  @IsBoolean()
  isDeceased?: boolean;
}

export class UpdatePetHealthHistoryPayloadDto extends PartialType(
  CreatePetHealthHistoryPayloadDto,
) {}

// # Response
export class UpdatePetResDto extends FindOnePetResDto {}
export class UpdatePetHealthHistoryResDto extends FindOnePetHealthHistoryResDto {}
