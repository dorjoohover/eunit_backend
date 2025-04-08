import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { font, header, marginX, marginY, PdfType } from './formatter';
import { UserEntity } from 'src/app/user/entities/user.entity';
import { LocationEntity } from 'src/data/location/entities/location.entity';
import { RealstatePdf } from './realstate';
import { Injectable } from '@nestjs/common';
@Injectable()
export class PdfService {
  constructor(private realstate: RealstatePdf) {}
  async createDefaultPdf() // lastname: string,
  // firstname: string,
  // title: string,
  : Promise<PDFKit.PDFDocument> {
    const doc = new PDFDocument({
      margins: {
        left: marginX,
        right: marginX,
        top: marginY,
        bottom: marginY - 10,
      },
      size: 'A4',
    });

    doc.registerFont(font.bold, 'src/app/request/pdf/Montserrat-Bold.ttf');
    doc.registerFont(font.normal, 'src/app/request/pdf/Montserrat-Regular.ttf');
    doc.registerFont(font.thin, 'src/app/request/pdf/Montserrat-Light.ttf');
    // doc.registerFont(font.regular, regular);
    // doc.registerFont(fontBold, bold);
    // home(doc, lastname, firstname, title);
    // doc.addPage();
    doc.font(font.bold);
    return doc;
  }

  async createPdf(dto: PdfType) {
    const doc = await this.createDefaultPdf();

    try {
      const date = new Date(dto.data.createdAt);
      header(doc, date);
      await this.realstate.template(doc, dto);
      return doc
    } catch (error) {
      console.log(error);
      throw new Error('Failed to generate PDF');
    }
  }
}
