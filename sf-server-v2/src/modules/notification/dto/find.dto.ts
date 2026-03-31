import { Expose, Transform } from 'class-transformer';
import { IsString } from 'class-validator';

export class ReadNotificationQueryDto {
  @IsString({ each: true })
  ids: string[];
}

export class FindAllNotificationResDto {
  @Expose()
  @Transform(({ value }) => value.toString())
  id: number;

  @Expose()
  message: string;

  @Expose()
  isRead: boolean;

  @Expose()
  meta: Record<string, any>;

  @Expose()
  createdAt: string;
}
