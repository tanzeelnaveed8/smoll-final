import { PartialType } from '@nestjs/swagger';
import {
  CreateCasePayloadDto,
  CreateCaseQueryDto,
  CreateCaseQuotePayloadDto,
} from './create.dto';
import { FindOneCaseResDto } from './find.dto';

export class UpdateCaseQueryDto extends PartialType(CreateCaseQueryDto) {}
export class UpdateCasePayloadDto extends PartialType(CreateCasePayloadDto) {}

export class UpdateCaseResDto extends FindOneCaseResDto {}
export class UpdateCaseQuotePayloadDto extends PartialType(
  CreateCaseQuotePayloadDto,
) {}
