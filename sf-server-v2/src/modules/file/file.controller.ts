import {
  Controller,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileService } from './file.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreateFilePayloadDto, CreateFileResDto } from './dto/create.dto';
import { plainToInstance } from 'class-transformer';
import { AuthGuard } from '@nestjs/passport';

@Controller('/files')
@ApiTags('File')
@ApiBearerAuth()
@UseGuards(AuthGuard())
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: CreateFilePayloadDto,
  })
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadLogo(@UploadedFiles() files: Express.Multer.File[]) {
    const _files = await this.fileService.upload(files);

    return plainToInstance(CreateFileResDto, _files, {
      excludeExtraneousValues: true,
    });
  }
}
