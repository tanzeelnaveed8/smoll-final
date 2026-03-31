import { IsInt, IsPositive, IsString } from 'class-validator';

export class CreateBenefit {
  @IsInt()
  planId: number;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsInt()
  @IsPositive()
  maxUsagePerSubscription: number;
}
