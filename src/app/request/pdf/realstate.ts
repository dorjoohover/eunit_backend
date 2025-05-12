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
  price,
  reportDescription,
} from './formatter';
import { SERVICE } from 'src/base/constants';
import SVGtoPDF from 'svg-to-pdfkit';
import { svgs } from './icons';
import { Utils } from 'src/common';
@Injectable()
export class RealstatePdf {
  constructor() {}

  async template(doc: PDFKit.PDFDocument, dto: PdfType) {
    const reviewWidth = doc
      .fontSize(fz.xl)
      .font(font.bold)
      .widthOfString('Лавлагаа');
    doc.y += 37.5;
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
      .text(
        !dto.info.usage || dto.info.usage == 30
          ? 'Зах зээлийн үнэ цэний лавлагаа'.toUpperCase()
          : 'ББСБ-Д ЗОРИУЛСАН ХӨРӨНГИЙН ҮНЭЛГЭЭ',
        {
          align: 'center',
        },
      );
    doc.y += 30;
    doc.fontSize(fz.sm).text('Ерөнхий мэдээлэл');
    doc.y += 10;
    doc.x += 20;
    let lastname = dto.info?.lastname ?? dto.user?.lastname;
    if (lastname) lastname.substring(0, 1).toUpperCase() + '.';
    if (
      dto.user?.lastname ||
      dto.user?.firstname ||
      dto.info?.lastname ||
      dto.info?.firstname
    ) {
      doc
        .font(font.thin)
        .fontSize(fz.xs)
        .text(`Овог нэр: `, {
          continued: true,
          underline: false,
        })
        .font(font.normal)
        .text(
          `${lastname}${dto.info?.firstname ? ` ${firstLetterUpper(dto.info?.firstname)}` : dto.user?.firstname ? ` ${firstLetterUpper(dto.user?.firstname)}` : ''}`,
          {
            continued: true,
            underline: true,
          },
        )
        .text(' ', { underline: false, continued: true });
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
    doc.text('', { continued: false, underline: false });
    doc.y += dto.user?.phone ? 10 : 20;
    let x = doc.x;
    if (dto.data.area != null) {
      doc.image(assetPath('icons/apartment'), x, doc.y, {
        width: 15,
        height: 15,
      });
      doc.text('Орон сууц', x + 18, doc.y);
    }
    if (dto.category == SERVICE.CAR) {
      SVGtoPDF(doc, svgs('car', 20, 20), x, doc.y, { width: 18, height: 18 });

      doc.text('Автомашин', x + 18, doc.y);
    }

    doc.y += 10;

    if (dto.location) {
      doc.image(assetPath('icons/location'), x, doc.y, {
        width: 15,
        height: 15,
      });
      doc.text(
        `${dto.location.city} хот, ${dto.location.district} дүүрэг, ${dto.location.khoroo}-р хороо, ${dto.location.town} хотхон`,
        x + 18,
        doc.y,
      );
      doc.y += 15;
    }
    doc.x = marginX;
    doc.fontSize(fz.sm).font(font.bold).text('Тооцоолол');
    doc.x += 20;
    doc.y += 10;
    if (dto.data.area != null) {
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
      console.log(dto.data);
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
    }
    if (dto.category == SERVICE.CAR) {
      doc
        .font(font.thin)
        .fontSize(fz.xs)
        .text('Таны сонгосон автомашины үнэ цэн:', {
          continued: true,
        })
        .font(font.bold)
        .fillColor(colors.blue)
        .text(`₮${money(dto.data.price.toString())}`);
      doc.y += 10;
    }
    doc.x = marginX;

    doc.fontSize(fz.sm).fillColor(colors.black).font(font.bold).text('Тайлбар');
    doc.y += 10;
    doc.x += 20;
    doc
      .fontSize(fz.xs)
      .font(font.thin)
      .text(
        reportDescription(
          `${dto.user?.lastname ?? ''} ${
            dto.user?.firstname ??
            (dto?.user?.lastname == null
              ? dto.user?.phone
                ? formatPhoneNumber(dto.user?.phone)
                : (dto.user?.email ?? '')
              : '')
          }`,
          dto.category,
          dto.data.area,
          dto.data.avg,
          dto.location,
          {
            floor: dto.data.floor,
            no: dto.data.no,
            room: dto.data.room,
            brand: dto.data.brand,
            capacity: dto.data.capacity,
            mark: dto.data.mark,
            manufacture: dto.data.manufacture,
            engine: dto.data.engine,
            entry: dto.data.entry,
          },
        ),
        {
          continued: true,
        },
      )
      .font(font.bold)
      .fillColor(colors.blue)
      .text(
        `${price(
          dto.data.area != null ? SERVICE.REALSTATE : SERVICE.CAR,
          dto.data.price,
          dto.data.area * dto.data.avg,
        )} төгрөг`,
        {
          continued: true,
        },
      )
      .font(font.thin)
      .fillColor(colors.black)
      .text(
        ` орчим үнэтэй байна. Энэхүү тооцоолол нь өгөгдөлд суурилж тооцоолсон бөгөөд ±5%-ийн хооронд хэлбэлзэх боломжтой.`,
      );
    if (dto.category == SERVICE.CAR) {
      doc.x = marginX;
      doc.y += 10;
      doc
        .fontSize(fz.sm)
        .fillColor(colors.black)
        .font(font.bold)
        .text('Техникийн үзүүлэлт');
      doc.y += 10;
      doc.x += 20;
      Object.entries(Utils.carFields).map(([key, value], i) => {
        return this.carField(doc, key, value, dto.data[key], i);
      });
      doc.x = marginX;
    }

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
    if (dto.info.usage && dto.info.usage != 30) {
      doc.image(
        assetPath('stamp0'),
        (doc.page.width / 3) * 2,
        doc.page.height - 25 - copyrightHeight - footerHeight - 150,
        {
          width: 80,
          height: 80,
        },
      );
      doc.image(
        assetPath('stamp1'),
        doc.x,
        doc.page.height - 25 - copyrightHeight - footerHeight - 80,
        {
          width: 120,
          height: 120,
        },
      );
    }
  }

  async carField(
    doc: PDFKit.PDFDocument,
    icon: string,
    title: string,
    label: string,
    index: number,
    w = 24,
    h = 24,
  ) {
    const width = (doc.page.width - marginX - marginX - 52 - 20) / 4;
    const radius = 7;
    const height = 45;
    let x = doc.x;
    // console.log(first)
    let y = doc.y;
    y += index % 4 == 0 ? (index != 0 ? height + 10 : 0) : 0;
    doc
      .moveTo(x + radius, y)
      .lineTo(x + width - radius, y)
      .quadraticCurveTo(x + width, y, x + width, y + radius)
      .lineTo(x + width, y + height - radius)
      .quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
      .lineTo(x + radius, y + height)
      .quadraticCurveTo(doc.x, y + height, doc.x, y + height - radius)
      .lineTo(doc.x, y + radius)
      .quadraticCurveTo(doc.x, y, x + radius, y)
      .closePath();
    doc.fillAndStroke('#ffffff', '#DDDDDD');
    SVGtoPDF(doc, svgs(icon, w, h), x + 10, y + 12, {
      width: w,
      height: h,
    });
    doc.font(font.bold).fillColor('#262626').fontSize(8);
    doc.text(title, x + 32, y + 10);
    doc.lineGap(1);
    doc.font(font.normal).fontSize(10);

    doc.text(
      title === 'Гүйлт'
        ? `${money(label)}км`
        : title == 'Багтаамж'
          ? `${label}л`
          : firstLetterUpper(`${label}`),
      doc.x,
      y + 20,
    );
    doc.x = index % 4 == 3 ? marginX + 20 : x + width + 14;
    doc.y = y;
  }
}
