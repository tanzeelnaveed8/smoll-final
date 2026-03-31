import { PartialType } from '@nestjs/swagger';
import { CreatePartnerPayloadDto } from './create.admin.dto';
import { FindPartnerAdminResDto } from './find.admin.dto';

export class UpdatePartnerPayloadDto extends PartialType(
  CreatePartnerPayloadDto,
) {}

export class UpdatePartnerResDto extends FindPartnerAdminResDto {}
