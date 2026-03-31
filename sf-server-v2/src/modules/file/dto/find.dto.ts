import { Expose } from 'class-transformer';

export class FindFileResDto {
  @Expose()
  filename: string;

  @Expose()
  filesize: number;

  @Expose()
  mimetype: string;

  @Expose()
  url: string;
}
