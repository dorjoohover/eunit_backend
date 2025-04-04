import path from 'path';
import fs from 'fs';
import { UserEntity } from 'src/app/user/entities/user.entity';
import { LocationEntity } from 'src/data/location/entities/location.entity';
export const marginX = 40;
export const marginY = 30;

export const colors = {
  blue: '#182F94',
  black: '#000000',
  blackish: '#030303',
  indogo: '#2850FA',
};

export type PdfType = {
  data: {
    area: number;
    createdAt: Date;
    no: string;
    room: number;
    floor: number;
    min: number;
    max: number;
    avg: number;
  };
  user: UserEntity;
  location: LocationEntity;
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

// console.log(formatPhoneNumber('+97688992864')); // Output: "+976 8899-2864"

export const money = (value: string, currency = '') => {
  return `${currency}${value
    .replaceAll(',', '')
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

export const firstLetterUpper = (text: string) => {
  return text.substring(0, 1).toUpperCase() + text.substring(1).toLowerCase();
};
export const dateFormatter = (date: Date): string => {
  const year = date.getFullYear();
  let month = `${date.getMonth() + 1}`;
  parseInt(month) < 10 ? (month = `0${month}`) : null;
  let day = `${date.getDate()}`;
  parseInt(day) < 10 ? (day = `0${day}`) : null;
  return `${year}.${month}.${day}`;
};

export const header = (doc: PDFKit.PDFDocument, date: Date) => {
  doc.fontSize(10);

  doc.image(assetPath('logo'), marginX, marginY, {
    width: 60,
  });
  doc
    .fontSize(fz.xs)
    .font(font.normal)
    .fillColor(colors.blackish)
    .text(`Огноо:${dateFormatter(date)}`, doc.x, doc.y + 24, {
      align: 'right',
    });
  doc.x = marginX;
};
