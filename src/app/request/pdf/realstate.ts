import { Injectable } from '@nestjs/common';
import {
  assetPath,
  colors,
  dateFormatter,
  firstLetterUpper,
  font,
  formatPhoneNumber,
  fz,
  marginX,
  money,
  PdfType,
} from './formatter';

@Injectable()
export class RealstatePdf {
  constructor() {}

  async template(doc: PDFKit.PDFDocument, dto: PdfType) {
    const reviewWidth = doc
      .fontSize(fz.xl)
      .font(font.bold)
      .widthOfString('Лавлагаа');
    doc.y += 75;
    let y = doc.y;
    let grad = doc.linearGradient(
      marginX,
      y + 8,
      doc.page.width - marginX - marginX - reviewWidth - 50,
      29,
    );
    grad.stop(0, colors.indogo).stop(1, colors.blue);

    doc.rect(
      marginX,
      y + 8,
      doc.page.width - marginX - marginX - reviewWidth - 50,
      29,
    );
    doc.fill(grad);
    // icons
    doc

      .fillColor(colors.blue)
      // .font(fontNormal)
      .fontSize(fz.xl)
      .text(
        'Лавлагаа'.toUpperCase(),
        doc.page.width - marginX - reviewWidth - 40,
        y,
      );
    doc.y += 30;
    doc.x = marginX;
    doc
      .fillColor(colors.black)
      .fontSize(fz.md)
      .text('Зах зээлийн үнэ цэний лавлагаа'.toUpperCase(), {
        align: 'center',
      });
    doc.y += 30;
    doc.fontSize(fz.sm).text('Ерөнхий мэдээлэл');
    doc.y += 10;
    doc.x += 20;
    let lastname = dto.user?.lastname;
    if (lastname) lastname.substring(0, 1).toUpperCase() + '.';
    if (dto.user?.lastname || dto.user?.firstname) {
      doc
        .font(font.thin)
        .fontSize(fz.xs)
        .text(`Овог нэр: `, {
          continued: true,
          underline: false,
        })
        .font(font.normal)
        .text(
          `${lastname}${dto.user?.firstname && firstLetterUpper(dto.user?.firstname)}  `,
          {
            continued: true,
            underline: true,
          },
        );
    }
    if (dto.user?.email)
      doc
        .fontSize(fz.xs)
        .font(font.thin)
        .text(`Цахим хаяг: `, {
          continued: true,
          underline: false,
        })
        .font(font.normal)
        .text(`${dto.user.email}`, {
          underline: true,
          continued: true,
        })
        .text('  ', {
          continued: true,
          underline: false,
        });

    if (dto.user?.phone)
      doc
        .font(font.thin)
        .fontSize(fz.xs)
        .text(`Утасны дугаар: `, {
          continued: true,
        })
        .font(font.normal)
        .text(`${formatPhoneNumber(dto.user.phone)}`, {
          underline: true,
        });
    doc.y += 10;
    let x = doc.x;
    doc.image(assetPath('icons/apartment'), x, doc.y, {
      width: 15,
      height: 15,
    });
    doc.text('Орон сууц', x + 18, doc.y, {
      underline: false,
    });
    doc.y += 10;
    doc.image(assetPath('icons/location'), x, doc.y, {
      width: 15,
      height: 15,
    });
    doc.text(
      `${dto.location.city} хот, ${dto.location.district} дүүрэг, ${dto.location.khoroo}-р хороо, ${dto.location.town} хотхон`,
      x + 18,
      doc.y,
    );
    doc.x = marginX;
    doc.y += 15;
    doc.fontSize(fz.sm).font(font.bold).text('Тооцоолол');
    doc.x += 20;
    doc.y += 10;
    doc
      .font(font.thin)
      .fontSize(fz.xs)
      .text('Таны сонгосон хотхоны м.кв үнэ цэн:', {
        continued: true,
      })
      .font(font.bold)
      .fillColor(colors.blue)
      .text(`₮${money(dto.data.min.toString())}`, { continued: true })
      .font(font.thin)
      .fillColor(colors.black)
      .text(`-оос `, {
        continued: true,
      })
      .font(font.bold)
      .fillColor(colors.blue)
      .text(`₮${money(dto.data.max.toString())}`, {
        continued: true,
      })
      .fillColor(colors.black)
      .font(font.thin)
      .text(` хооронд`);
    doc.y += 10;
    doc
      .text('Таны сонгосон сууцны м.кв тохиромжит үнэ:', {
        continued: true,
      })
      .font(font.bold)
      .fillColor(colors.blue)
      .text(`₮${money(dto.data.avg.toString())}`);
    doc.y += 10;
    doc
      .fillColor(colors.black)
      .font(font.thin)
      .text(`Таны ${dto.data.area} м.кв орон сууцны нийт үнэ:`, {
        continued: true,
      })
      .font(font.bold)
      .fillColor(colors.blue)
      .text(`${money(`${dto.data.avg * dto.data.area}`, '₮', 100000)}`);
    doc.y += 15;
    doc.x = marginX;
    doc.fontSize(fz.sm).fillColor(colors.black).font(font.bold).text('Тайлбар');
    doc.y += 10;
    doc.x += 20;
    doc

      .fontSize(fz.xs)
      .font(font.thin)
      .text(
        `Иргэн ${lastname ?? ''} ${dto.user.firstname ?? (dto.user.phone && formatPhoneNumber(dto.user.phone))} таны ${dto.location.city} хот, ${dto.location.district} дүүрэг, ${dto.location.khoroo}-р хороо, ${dto.location.zipcode}, ${dto.location.town} хотхон, ${dto.data.area}м.кв орон сууцны өнөөгийн зах зээлийн үнэ `,
      )
      .font(font.bold)
      .fillColor(colors.blue)
      .text(`${money(`${dto.data.area * dto.data.avg}`, '', 100000)} төгрөг`)
      .font(font.thin)
      .fillColor(colors.black)
      .text(
        ` орчим үнэтэй байна. Энэхүү тооцоолол нь өгөгдөлд суурилж тооцоолсон бөгөөд ±5%-ийн хооронд хэлбэлзэх боломжтой.`,
      );

    const date = new Date(dto.data.createdAt);
    date.setDate(date.getDate() + 7);
    doc.fontSize(fz.xs);
    const d = `Хүчинтэй хугацаа дуусах огноо: ${dateFormatter(date)}`;
    const dateHeight = doc.heightOfString(d);

    const footer =
      'Энэхүү лавлагаа нь 7 хоногийн хугацаанд хүчинтэй бөгөөд ямар нэгэн байдлаар олшруулахыг хориглоно.';

    const footerHeight = doc.heightOfString(footer);
    const copy = '©2025 www.eunit.mn. Бүх эрх хуулиар хамгаалагдсан.';

    const copyrightHeight = doc.heightOfString(copy);

    doc
      .moveTo(
        marginX,
        doc.page.height - 25 - copyrightHeight - footerHeight - 20,
      )
      .strokeColor(colors.blackish)
      .lineTo(
        doc.page.width - marginX,
        doc.page.height - 25 - copyrightHeight - footerHeight - 20,
      )
      .stroke();
    doc
      .font(font.normal)
      .text(
        footer,
        doc.x,
        doc.page.height - copyrightHeight - footerHeight - 25,
      );
    doc
      .font(font.bold)
      .text(copy, doc.x, doc.page.height - 25 - copyrightHeight);
    doc.text(
      d,
      doc.x,
      doc.page.height - 25 - copyrightHeight - footerHeight - 20 - 30,
      {
        align: 'right',
      },
    );
  }
}
