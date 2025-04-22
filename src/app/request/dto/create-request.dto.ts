import { ApiProperty } from '@nestjs/swagger';
import { ParentProperty } from 'src/base/base.dto';
import { PaymentType } from 'src/base/constants';

export class RequetsFindDto {
  service?: number;
  payment?: number;
  page: number;
  limit: number;
  phone?: string;
  email?: string;
  status?: number;
  date?: string;
}
export class CarsDto {
  @ApiProperty()
  brand?: string;
  @ApiProperty()
  mark?: string;
  @ApiProperty()
  capacity?: number;
  @ApiProperty()
  manufacture?: number;
  @ApiProperty()
  entry?: number;
  @ApiProperty()
  gearbox?: string;
  @ApiProperty()
  hurd?: string;
  @ApiProperty()
  type?: string;
  @ApiProperty()
  color?: string;
  @ApiProperty()
  engine?: string;
  @ApiProperty()
  interior?: string;
  @ApiProperty()
  drive?: string;
  @ApiProperty()
  mileage?: number;
  @ApiProperty()
  conditions?: string;
}
export class CreateRequestDto extends CarsDto {
  @ApiProperty()
  service: number;
  @ApiProperty()
  area: number;
  @ApiProperty()
  operation?: number;
  @ApiProperty()
  category: number;
  @ApiProperty()
  no?: string;
  @ApiProperty()
  floor?: number;
  @ApiProperty()
  room?: number;
  @ApiProperty()
  user: number;
  @ApiProperty()
  location: number;
  @ApiProperty()
  startDate?: Date;
  @ApiProperty()
  endDate?: Date;

  @ApiProperty({ enum: PaymentType })
  payment: number;

  status: number;

  count?: number;
}
