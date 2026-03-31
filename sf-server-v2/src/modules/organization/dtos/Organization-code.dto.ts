import { Expose } from 'class-transformer';

export class OrganizationCodeDto {
  @Expose()
  codes: string;
}
