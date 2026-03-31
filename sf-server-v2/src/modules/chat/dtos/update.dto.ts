import { IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';

import { RolesEnum } from 'src/guards/role/role.enum';

export default class UpdateCometUserPayloadDto {
  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(RolesEnum)
  @IsOptional()
  role?: RolesEnum;

  @IsUrl()
  @IsOptional()
  avatar?: string;

  @IsString()
  @IsOptional()
  playerId?: string;
}
