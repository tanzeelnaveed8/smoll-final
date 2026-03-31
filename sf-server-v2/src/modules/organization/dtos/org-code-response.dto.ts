import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class OrgCodeResponseDto {
  @ApiProperty({
    description: 'Unique organization code',
    example: 'A1B2C3',
  })
  @Expose()
  code: string;

  @ApiProperty({
    description: 'Date when the code was used (null if unused)',
    example: null,
    required: false,
  })
  @Expose()
  usedAt?: Date;
}
