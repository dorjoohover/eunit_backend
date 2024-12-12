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
