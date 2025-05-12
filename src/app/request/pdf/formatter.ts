import path from 'path';
import fs from 'fs';
import { UserEntity } from 'src/app/user/entities/user.entity';
import { LocationEntity } from 'src/data/location/entities/location.entity';
import { SERVICE } from 'src/base/constants';
export const marginX = 40;
export const marginY = 30;

export const colors = {
  blue: '#182F94',
  black: '#000000',
  blackish: '#030303',
  indogo: '#2850FA',
};

export type PdfType = {
  data: any;
  // {
  // area?: number;
  // createdAt: Date;
  // no?: string;
  // room?: number;
  // floor?: number;
  // min?: number;
  // max?: number;
  // avg?: number;
  // };
  user: UserEntity;
  info?: any
  category: number;
  location?: LocationEntity;
};
export const assetPath = (p: string, a = 'png') => {
  const imagePath = path.join(__dirname, `../../../../src/assets/${p}.${a}`);
  return fs.readFileSync(imagePath);
};
export const fz = {
  xl: 36,
  md: 20,
  sm: 12,
  xs: 10,
};

export const font = {
  bold: 'bold',
  normal: 'medium',
  thin: 'thin',
};

export function formatPhoneNumber(phone: string) {
  if (!phone.startsWith('+976') || phone.length !== 12) {
    return 'Invalid number';
  }

  let digits = phone.slice(4);
  return `+976 ${digits.slice(0, 4)}-${digits.slice(4)}`;
}
export const price = (category: number, price: number, amount: number) => {
  switch (category) {
    case SERVICE.CAR:
      return money(price.toString(), '');
    case SERVICE.REALSTATE:
      return money(amount.toString(), '', 100000);
  }
};

// console.log(formatPhoneNumber('+97688992864')); // Output: "+976 8899-2864"
export const reportDescription = (
  name: string,
  category: number,
  area?: number,
  avg?: number,
  l?: LocationEntity,
  d?: {
    room?: number;
    no?: string;
    floor?: number;
    brand?: string;
    mark?: string;
    manufacture?: number;
    entry?: number;
    capacity?: string;
    engine?: string;
  },
) => {
  // Таны Улаанбаатар хот, Хан уул дүүрэг, 11-р хороо, 17020, Жардин хотхон, 120-р байр, 6 дугаар давхарын 3 өрөө 80м.кв орон сууцны өнөөгийн зах зээлийн үнэ 160,950,000.00 төгрөг орчмын үнэтэй байна.
  const town =
    l?.town?.toLowerCase().includes('хотхон') ||
    l?.town?.toLowerCase().includes('хороолол');
  const no = d?.no
    ? ` ${d?.no}${isNaN(parseInt(d.no)) ? '' : '-р'} байр, `
    : '';
  const floor = d?.floor ? `${d.floor}-р давхарын ` : '';
  const room = d?.room ? `${d.room} өрөө ` : '';
  const value =
    area != null
      ? `${l?.city} хот, ${l?.district} дүүрэг, ${l?.khoroo}-р хороо, ${
          l?.zipcode
        }, ${l?.town}${
          !town ? ' хотхон' : ''
        },${no}${floor}${room} ${area}м.кв орон сууцны`
      : `${d?.manufacture} онд үйлдвэрлэгдэж ${
          d?.entry
        } онд Монгол улсад импортлогдсон ${firstLetterUpper(
          d?.brand,
        )} брендын ${firstLetterUpper(d?.mark)} маркын ${
          d?.capacity
        } литрийн хөдөлгүүрийн багтаамжтай ${(
          d?.engine ?? ''
        ).toLowerCase()} машины`;

  return `Иргэн ${name} таны ${value} өнөөгийн зах зээлийн үнэ `;
};
export const money = (value: string, currency = '', round = 1) => {
  let v = Math.round(+value / round) * round;
  return `${currency}${v
    .toString()
    .replaceAll(',', '')
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

export const firstLetterUpper = (text: string) => {
  return (
    text?.substring(0, 1)?.toUpperCase() + text?.substring(1)?.toLowerCase()
  );
};
export const dateFormatter = (date: Date): string => {
  const year = date.getFullYear();
  let month = `${date.getMonth() + 1}`;
  parseInt(month) < 10 ? (month = `0${month}`) : null;
  let day = `${date.getDate()}`;
  parseInt(day) < 10 ? (day = `0${day}`) : null;
  return `${year}.${month}.${day}`;
};

export const header = (doc: PDFKit.PDFDocument, date: Date, info: any) => {
  doc.fontSize(10);

  doc.image(assetPath(info?.org == 'eunit' || !info?.org ? 'logo' : info.org), marginX, marginY, {
    width: 60,
  });
  doc
    .fontSize(fz.xs)
    .font(font.bold)
    .fillColor(colors.blackish)
    .text(`Огноо:${dateFormatter(date)}`, doc.x, doc.y + 24, {
      align: 'right',
    });
  doc.font(font.normal);
  doc.x = marginX;
};
