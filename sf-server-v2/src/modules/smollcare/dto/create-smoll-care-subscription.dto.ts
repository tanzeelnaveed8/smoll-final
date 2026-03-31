import { Expose } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class CreateSmollCareSubscriptionDto {
  @IsString()
  petId: string;

  @IsString()
  paymentMethodId: string;
}

export class CreateMockSubscriptionPayloadDto {
  @IsString()
  petId: string;

  @IsNumber()
  planId: number;
}

export class CreateMockSubscriptionResDto {
  @Expose()
  id: string;

  @Expose()
  status: string;

  @Expose()
  startDate: Date;

  @Expose()
  endDate: Date;
}
