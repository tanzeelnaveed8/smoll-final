import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

export class BundleOptionDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  label: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  badge?: string;

  @ApiProperty()
  @IsNumber()
  priceDelta: number;

  @ApiProperty()
  @IsNumber()
  multiplier: number;
}

export class DeliveryOfferDto {
  @ApiProperty()
  @IsString()
  icon: string;

  @ApiProperty()
  @IsString()
  text: string;
}

export class ProductTagDto {
  @ApiProperty()
  @IsString()
  icon: string;

  @ApiProperty()
  @IsString()
  text: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  color?: string;
}

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  price?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  stock?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  imageGallery?: string[];

  @ApiProperty({ required: false, type: [BundleOptionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BundleOptionDto)
  @IsOptional()
  bundleOptions?: BundleOptionDto[];

  @ApiProperty({ required: false, type: [DeliveryOfferDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DeliveryOfferDto)
  @IsOptional()
  deliveryOffers?: DeliveryOfferDto[];

  @ApiProperty({ required: false, type: [ProductTagDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductTagDto)
  @IsOptional()
  tags?: ProductTagDto[];
}
