import { Injectable } from '@nestjs/common';
import * as sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs';
@Injectable()
export class AppService {
  constructor() {}

  async processImage(file: Express.Multer.File): Promise<string> {
    const imageBuffer = file.buffer;

    const processImage = await sharp(imageBuffer)
      .jpeg({
        quality:
          file.size > 1000000
            ? (1000000 / file.size) * 100 < 20
              ? 20
              : (1000000 / file.size) * 100
            : 100,
      })
      .toBuffer();
    const uploadFolder = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadFolder))
      fs.mkdirSync(uploadFolder, { recursive: true });
    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(uploadFolder, fileName);
    fs.writeFileSync(filePath, processImage);

    return fileName;
  }
  async processMultipleImages(files: Express.Multer.File[]): Promise<string[]> {
    const processedFiles = await Promise.all(
      files.map(async (file) => {
        return await this.processImage(file);
      }),
    );

    return processedFiles;
  }
}
