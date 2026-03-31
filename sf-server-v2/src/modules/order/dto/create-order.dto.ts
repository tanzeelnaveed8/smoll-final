import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class OrderAddonDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsNumber()
  price: number;
}

export class OrderItemDto {
  @IsString()
  id: string;

  @IsString()
  type: 'service' | 'product';

  @IsString()
  title: string;

  @IsNumber()
  unitPrice: number;

  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsString()
  packageId?: string;

  @IsOptional()
  @IsString()
  packageLabel?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderAddonDto)
  addons?: OrderAddonDto[];

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class OrderScheduleDto {
  @IsOptional()
  @IsString()
  dateId?: string;

  @IsOptional()
  @IsString()
  labelTop?: string;

  @IsOptional()
  @IsString()
  labelBottom?: string;

  @IsOptional()
  @IsString()
  time?: string;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsNumber()
  total: number;

  @IsOptional()
  @IsString()
  paymentIntentId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => OrderScheduleDto)
  schedule?: OrderScheduleDto | null;
}
