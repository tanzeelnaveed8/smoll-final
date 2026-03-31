import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateSmollCareSubscriptionPayloadDto {
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @IsString()
  @IsNotEmpty()
  priceId: string;

  @IsString()
  @IsNotEmpty()
  paymentMethodId: string;
}

export class PetSubscriptionResponseDto {
  @Expose()
  subscriptionId: string;

  @Expose()
  clientSecret: string;

  @Expose()
  status: string;

  @Expose()
  currentPeriodStart: number;

  @Expose()
  currentPeriodEnd: number;

  @Expose()
  petId: string;

  @Expose()
  customerId: string;
}

export class PetSubscriptionSetupResponseDto {
  @Expose()
  paymentIntentClientSecret: string;

  @Expose()
  paymentIntent: any;

  @Expose()
  ephemeralKey: string;

  @Expose()
  petId: string;

  @Expose()
  percentageOff: number;
}

export class CancelPetSubscriptionDto {
  @IsString()
  @IsNotEmpty()
  petId: string;
}

export class GetPetSubscriptionsDto {
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @IsString()
  @IsOptional()
  petId?: string;
}
