import { Controller, Get, Param, Post, StreamableFile, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiParam } from '@nestjs/swagger';
import * as path from 'path'
import {diskStorage} from 'multer'
import { createReadStream } from 'fs';
@Controller()
export class AppController {

  constructor() {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename(req, file, callback) {
          callback(null, `${Date.now()}${file.originalname}`);
        },
      }),
    }),
  )
  async uploadSingle(@UploadedFile() file) {
    return {
      file: file.filename,
    };
  }

  @Get('/file/:file')
  @ApiParam({ name: 'file' })
  getFile(@Param('file') filename: string): StreamableFile {
    const file = createReadStream(
      path.join(__dirname, '../uploads/' + filename),
    );
    return new StreamableFile(file);
  }
}
