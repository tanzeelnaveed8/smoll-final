import { Expose } from 'class-transformer';

export class FindAnalyticsResDto {
  @Expose()
  cases: number;

  @Expose()
  partners: number;

  @Expose()
  vets: number;

  @Expose()
  members: number;

  @Expose()
  services: number;

  @Expose()
  products: number;

  @Expose()
  pendingCases: number;

  @Expose()
  confirmedCases: number;

  @Expose()
  rejectedCases: number;

  @Expose()
  escalatedCases: number;

  @Expose()
  totalRevenue: number;
}

export class FindOneAdminResDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  email: string;
}
