// dtos/delete-codes.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayNotEmpty, IsString } from 'class-validator';

export class DeleteCodesDto {
  @ApiProperty({
    description: 'Array of code strings to delete',
    example: ['ABC123', 'XYZ789', 'DEF456'],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  codes: string[];
}
