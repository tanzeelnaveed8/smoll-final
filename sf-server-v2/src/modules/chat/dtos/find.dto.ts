import { Expose, Transform } from 'class-transformer';
// import { RequestStatusEnum } from '../enums/request-status.enum';

export class FindAllCounsellingResDto {
  @Expose()
  @Transform(({ value }) => value.toString())
  id: number;

  // @Expose()
  // status: RequestStatusEnum;

  @Expose()
  roomId: string;

  @Expose()
  createdAt: Date;
}
