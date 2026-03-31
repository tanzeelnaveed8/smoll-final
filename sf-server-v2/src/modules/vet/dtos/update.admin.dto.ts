import { PartialType } from '@nestjs/swagger';
import { CreateVetPayloadDto } from './create.admin.dto';
import { FindOneVetAdminResDto } from './find.admin.dto';

export class UpdateVetPayloadDto extends PartialType(CreateVetPayloadDto) {}
export class UpdateVetResDto extends FindOneVetAdminResDto {}
