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

export class CalculateBuildingDto {
  @ApiProperty()
  name: string;
  @ApiProperty()
  account: number;
  @ApiProperty()
  depreciation: number;
  @ApiProperty({ nullable: true })
  year: number;
  @ApiProperty()
  date: string;
  @ApiProperty()
  initial: number;
  @ApiProperty()
  code: string;
  @ApiProperty()
  operation: number;
  @ApiProperty()
  usage: string;
  @ApiProperty()
  type: string;
  @ApiProperty()
  catalog: string;

  @ApiProperty()
  class: string;

  @ApiProperty()
  // Нийт талбайн хэмжээ /м.кв/
  area: number;
  @ApiProperty()
  // Нийт давхар
  buildingFloor: number;
  @ApiProperty()
  // Нэгж хүчин чадлын жишиг үнэ, төг
  unitPrice: number;
  @ApiProperty()
  // Ханын зузааны итгэлцүүр
  coefficient: number;
  @ApiProperty()
  // Тухайн хөрөнгийн байршлын зай
  distance: number;
  @ApiProperty()
  // Тээврийн зайн итгэлцүүр
  range: string;
  @ApiProperty()
  // Үнэлж буй хөрөнгийн байршил
  location: number;
  @ApiProperty()
  // Ханийн зузаан
  haniinZuzaan: number;
  // @ApiProperty()
  // // Нутаг дэвсгэрийн бүсчлэлийн итгэлцүүр
  // zone: string;
  @ApiProperty()
  // Байгалийн хүчин зүйлийн нөлөөллийн итгэлцүүр
  natural: number;
  @ApiProperty()
  // Инженерийн шугам сүлжээний холбогдлын итгэлцүүр
  engineering: number;
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
  @ApiProperty()
  // Биет хэмжээ
  size?: string;
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
  name: string;

  code: string;

  operation?: number;

  year?: number;

  area?: number;

  initial?: number;

  depreciation?: number;

  account?: number;

  elegdel?: number;

  elegdelPercent?: number;

  burenOrtog?: number;

  price?: number;

  date?: string;
}

export class CalculateApartmentDto {
  @ApiProperty()
  district: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  code: string;
  @ApiProperty()
  operation: number;
  @ApiProperty()
  year: number;
  @ApiProperty()
  account: number;
  @ApiProperty()
  date: string;
  @ApiProperty()
  depreciation: number;
  @ApiProperty()
  initial: number;
  @ApiProperty()
  khoroo: string;
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
