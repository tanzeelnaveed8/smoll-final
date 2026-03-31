import { IsString, IsNotEmpty, IsEnum, IsNumber, Min } from 'class-validator';
import { PlanCycle } from '../enums/plan-cycle.enum';

export class CreateSmollCarePlanDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @IsString()
  stripePriceId: string;

  @IsEnum(PlanCycle)
  cycle: PlanCycle;
}
