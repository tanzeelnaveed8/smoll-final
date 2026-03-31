import { Expose, Transform } from 'class-transformer';
// import { RequestStatusEnum } from '../enums/request-status.enum';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCounsellingReqResDto {
  @Expose()
  @Transform(({ value }) => value.toString())
  id: number;

  // @Expose()
  // status: RequestStatusEnum;

  @Expose()
  roomId: string;
}
