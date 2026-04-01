import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class CreateAdSpotDto {
  @IsString()
  @MaxLength(100)
  title: string;

  @IsString()
  imageUrl: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  actionLabel?: string;

  @IsString()
  @IsOptional()
  actionUrl?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  position?: string;
}

export class UpdateAdSpotDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  title?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  actionLabel?: string;

  @IsString()
  @IsOptional()
  actionUrl?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  position?: string;
}
