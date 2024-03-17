import {
  Controller,
  Get,
  Param,
  Post,
  Res,
  StreamableFile,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiParam } from '@nestjs/swagger';
import * as path from 'path';
import { createReadStream } from 'fs';
import { join } from 'path';
import { multerOptions } from './multer.config';
import type { Response } from 'express';

@Controller()
export class AppController {
  constructor() {}

  // @Post()
  // @UseInterceptors(
  //   FileInterceptor('file', {
  //     storage: diskStorage({
  //       destination: './uploads',
  //       filename(req, file, callback) {
  //         callback(null, `${Date.now()}${file.originalname}`);
  //       },
  //     }),
  //   }),
  // )
  // async uploadSingle(@UploadedFiles() file) {
  //   console.log(file);
  //   return {
  //     file: file.filename,
  //   };
  // }
  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 8, multerOptions))
  async multiFileUpload(@UploadedFiles() file: Array<Express.Multer.File>) {
    const files = file.map((f) => f.filename);
    return {
      file: files,
    };
  }

  @Get('/file/:file')
  @ApiParam({ name: 'file' })
  getFile(@Param('file') filename: string): StreamableFile {
    const file = createReadStream(path.join('./uploads/' + filename));
    return new StreamableFile(file);
  }
}
