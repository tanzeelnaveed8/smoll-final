import { Expose } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePaymentSessionDto {
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsString()
  @IsNotEmpty()
  currency: string;
}

export class CreatePaymentSessionResponseDto {
  @Expose()
  paymentIntent: string;

  @Expose()
  ephemeralKey: string;

  @Expose()
  customer: string;

  @Expose()
  paymentIntentClientSecret: string;
}
