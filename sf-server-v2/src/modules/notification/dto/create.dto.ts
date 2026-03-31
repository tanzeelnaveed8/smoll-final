import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateNotificationPayloadDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsOptional()
  @IsObject()
  meta?: Record<string, any>;
}

export class SendOneSignalNotificationDto {
  @IsString()
  @IsNotEmpty()
  playerId: string;

  @IsString()
  @IsNotEmpty()
  heading: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsOptional()
  @IsObject()
  meta?: Record<string, any>;

  @IsOptional()
  @IsString()
  icon?: string;
}
