import { ApiProperty } from '@nestjs/swagger';
import { FindFileResDto } from './find.dto';

export class CreateFilePayloadDto {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    required: true,
  })
  files: Express.Multer.File[];
}

export class CreateFileResDto extends FindFileResDto {}
