import togtool from '../excel/togtool.json';
export const DEFAULT_SIZE = 20;

export const DEFAULT_LIMIT = 20;
export const DEFAULT_OFFSET = 0;

export const ADMIN = 10;
export const CLIENT = 20;

export const ServiceType = {
  REPORT: 10,
  REVIEW: 20,
  DATA: 30,
};

export const SERVICE = {
  REALSTATE: 10,
  CAR: 20,
};

export const Status = {
  ACTIVE: 10,
  BANNED: 20,
  UNVERIFIED: 20,
};

export const ConstantValue = {
  DISTRICT: 10,
  TOWN: 20,
  NOTTOWN: 30,
};

export const SaleStatus = {
  DELETED: -10,
  ORDERED: 10,
  DELIVERED: 20,
  REFUNDED: 30,
};

export const TerminalStatus = {
  ACTIVE: 10,
  DELETED: 20,
};

export const ProductVatType = {
  VAT: 10,
  VAT_FREE: 20,
  VAT_ZERO: 30,
};

export const ServiceDataType = {
  APARTMENT: 10,
  BUILDING: 20,
  STRUCTURE: 30,
  ENGINEERING: 40,
  VEHICLE: 50,
  EQUIPMENT: 60,
  FURNITURE: 70,
  COMPUTER: 80,
  OTHER: 90,
};

export const PaymentType = {
  QPAY: 1,
  POINT: 2,
  LOYALTY: 3,
  LOAN: 4,
  SOCIAL: 5,
};

export const PaymentStatus = {
  SUCCESS: 10,
  PENDING: 20,
  ERROR: 30,
};

export const ProductMeasureUnitDict = {
  10: 'л',
  20: 'ш',
};

export const SaleStatusDict = {
  '-10': 'Устгасан',
  10: 'Үүссэн',
  20: 'Ээлж хаасан',
};

export const NutagDevsgerBuschlel = {
  'Улаанбаатар хот': 1,
  Архангай: 0.68,
  Баянхонгор: 0.82,
  Булган: 0.66,
  'Говь-Алтай': 0.73,
  'Дархан-Уул': 0.83,
  Дорноговь: 0.69,
  Дорнод: 0.74,
  Дундговь: 0.67,
  Завхан: 0.69,
  Орхон: 0.68,
  Өвөрхангай: 0.66,
  Өмнөговь: 0.65,
  Сүхбаатар: 0.52,
  Сэлэнгэ: 0.63,
  Төв: 0.64,
  Увс: 0.74,
  Хөвсгөл: 0.75,
  Хэнтий: 0.63,
  Ховд: 0.73,
  'Баян-Өлгий': 0.69,
  Говьсүмбэр: 0.67,
  'Өмнөговь аймгийн Цогтцэций, Ханбогд сум, Дорноговь аймгийн Замын-үүд сум': 0.69,
};
