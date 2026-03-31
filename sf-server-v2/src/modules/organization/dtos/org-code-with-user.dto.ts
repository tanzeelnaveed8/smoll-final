import { Expose, Type } from 'class-transformer';

class MemberDto {
  @Expose()
  id: string;

  @Expose()
  name?: string;

  @Expose()
  email?: string;

  @Expose()
  phone?: string;
}

export class OrgCodeWithUserDto {
  @Expose()
  code: string;

  @Expose()
  usedAt: Date | null;

  @Expose()
  maxUsageMonths: number | null;

  @Expose()
  @Type(() => MemberDto)
  member: MemberDto | null;
}
