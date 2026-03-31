import * as AWS from 'aws-sdk';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateFileResDto } from './dto/create.dto';

@Injectable()
export class FileService {
  private s3: AWS.S3;
  private endpoint: AWS.Endpoint;

  constructor(private configService: ConfigService) {
    this.endpoint = new AWS.Endpoint('https://fra1.digitaloceanspaces.com');

    this.s3 = new AWS.S3({
      endpoint: this.endpoint,
      accessKeyId: this.configService.get('SPACES_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('SPACES_SECRET_ACCESS_KEY'),
    });
  }

  async upload(files: Express.Multer.File[]): Promise<CreateFileResDto[]> {
    const urls: CreateFileResDto[] = [];

    for (const file of files) {
      const key = `${Date.now()}-${file.originalname.replace(/ /g, '_')}`;
      const url = `https://sfriend.fra1.cdn.digitaloceanspaces.com/${key}`;

      await this.s3
        .putObject({
          Bucket: this.configService.get('SPACES_BUCKET_NAME'),
          Key: key,
          Body: file.buffer,
          ACL: 'public-read',
        })
        .promise();

      urls.push({
        filename: file.originalname,
        filesize: file.size,
        mimetype: file.mimetype,
        url,
      });
    }

    return urls;
  }

  async delete(key: string[]): Promise<void> {
    await this.s3
      .deleteObjects({
        Bucket: this.configService.get('SPACES_BUCKET_NAME'),
        Delete: {
          Objects: key.map((k) => ({ Key: k })),
        },
      })
      .promise();

    return;
  }
}
