import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { PetSpeciesEnum } from '../pet-species.enum';
import { FindOnePetHealthHistoryResDto, FindOnePetResDto } from './find.dto';
import { OmitType } from '@nestjs/swagger';
import { FindFileResDto } from '../../../modules/file/dto/find.dto';
import { PetGenderEnum } from '../enums/pet-gender.enum';

// # Payload
export class CreatePetPayloadDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  age: number;

  @IsNumber()
  @IsOptional()
  weight: number;

  @IsEnum(PetSpeciesEnum)
  species: PetSpeciesEnum;

  @IsEnum(PetGenderEnum)
  gender: PetGenderEnum;

  @IsBoolean()
  @IsNotEmpty()
  spayedOrNeutered: boolean;

  @IsString()
  @IsNotEmpty()
  breed: string;

  @IsDateString()
  @IsNotEmpty()
  dob: Date;

  @IsString()
  @IsOptional()
  preExistingConditions?: string;

  @IsString()
  @IsOptional()
  chipNumber?: string;

  @IsOptional()
  @IsArray()
  photos?: FindFileResDto[];
}

export class CreatePetHealthHistoryPayloadDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDateString()
  @IsNotEmpty()
  date: Date;

  @IsArray()
  @IsOptional()
  documents: FindFileResDto[];
}

// # Response
export class CreatePetResDto extends OmitType(FindOnePetResDto, [
  'healthHistory',
]) {}
export class CreatePetHealthHistoryResDto extends FindOnePetHealthHistoryResDto {}
