import { ApiProperty } from '@nestjs/swagger';
import { ParentProperty } from 'src/base/base.dto';
import { ServiceType } from 'src/base/constants';

export class CreateAdDto {
  @ApiProperty()
  title: string;
  @ApiProperty({
    type: ParentProperty,
  })
  location: {
    id: number;
  };

  @ApiProperty()
  area: number;

  @ApiProperty()
  price: number;
  @ApiProperty()
  operation: number;
  @ApiProperty()
  paymentMethod?: string;
  @ApiProperty()
  buildingProcess?: string;
  @ApiProperty()
  uneguiId: string;
  @ApiProperty()
  unitPrice: number;
  @ApiProperty()
  floor?: string;
  @ApiProperty()
  door?: string;
  @ApiProperty()
  balconyUnit?: string;
  @ApiProperty()
  date: Date;
  @ApiProperty()
  howFloor?: number;
  @ApiProperty()
  buildingFloor: number;
  @ApiProperty()
  windowUnit?: string;
  @ApiProperty()
  garage?: string;
  @ApiProperty()
  window?: string;
  @ApiProperty()
  description: string;
  @ApiProperty()
  landUsage?: string;
}

export class CalcDataDto {
  @ApiProperty()
  location: number;
  @ApiProperty()
  area: number;
  @ApiProperty()
  type: number;
  @ApiProperty()
  startDate?: Date;
  @ApiProperty()
  endDate?: Date;
  @ApiProperty()
  paid?: boolean;
}

export class ServiceDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  code: string;
  @ApiProperty()
  type: number;
  @ApiProperty()
  date: string;
  @ApiProperty()
  year: number;
  @ApiProperty()
  aggregations: {
    [key: string]: any;
  };

  @ApiProperty()
  initial?: number;

  @ApiProperty()
  depreciation?: number;

  @ApiProperty()
  account?: number;

  elegdel?: number;

  elegdelPercent?: number;

  burenOrtog?: number;

  price?: number;
}

export class CalculateApartmentDto {
  @ApiProperty()
  district: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  code: string;

  @ApiProperty()
  khoroo: string;
  @ApiProperty()
  area: number;
  @ApiProperty({
    type: Date,
  })
  index: Date;
}
export class CalculateBuildingDto {
  @ApiProperty()
  usage: string;
  @ApiProperty()
  type: string;
  @ApiProperty()
  class: string;
  @ApiProperty()
  // Нийт талбайн хэмжээ /м.кв/
  area: number;
  @ApiProperty()
  // Нийт давхар
  buildingFloor: number;

  // @ApiProperty()
  // // Тухайн хөрөнгийн байршлын зай
  // distance: number;
  @ApiProperty()
  // Тээврийн зайн итгэлцүүр
  range: string;
  @ApiProperty()
  // Үнэлж буй хөрөнгийн байршил
  location: number;
  @ApiProperty()
  // Ханийн зузаан
  haniinZuzaan?: number;
  // @ApiProperty()
  // // Нутаг дэвсгэрийн бүсчлэлийн итгэлцүүр
  // zone: string;
  @ApiProperty()
  // Байгалийн хүчин зүйлийн нөлөөллийн итгэлцүүр
  natural?: number;
  @ApiProperty()
  // Инженерийн шугам сүлжээний холбогдлын итгэлцүүр
  engineering?: number;
  @ApiProperty()
  // Үндсэн хийц чанар байдал
  quality: string;
  @ApiProperty()
  // Дээвэр чанар байдал
  ceil: string;
  @ApiProperty()
  san: string;
  @ApiProperty()
  electric: string;
  @ApiProperty({
    type: Date,
  })
  index: Date;
  // @ApiProperty()
  // // Ханын зузааны итгэлцүүр
  // coefficient: number;
  // operation: d.operation ?? 0,
}
