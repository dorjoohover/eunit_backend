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
  capacity?: string;
  @ApiProperty()
  manufacture?: number;
  @ApiProperty()
  entry?: number;
  @ApiProperty()
  gearbox?: string;
  @ApiProperty()
  hurd?: string;
  // @ApiProperty()
  // type?: string;
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
export type VehicleInfo = {
  archiveDate: string | null;
  archiveFirstNumber: string | null;
  archiveNumber: string | null;
  axleCount: number;
  buildYear: number;
  cabinNumber: string | null;
  capacity: number;
  certificateNumber: string | null;
  className: string | null;
  colorName: string | null;
  countryName: string | null;
  fueltype: string | null;
  height: number;
  importDate: string | null;
  intent: string | null;
  length: number;
  manCount: number;
  markName: string | null;
  mass: number;
  modelName: string | null;
  motorNumber: string | null;
  ownerAddress: {
    apartment: string | null;
    door: string | null;
    soum: string | null;
    state: string | null;
    street: string | null;
    town: string | null;
  };
  ownerCountry: string | null;
  ownerFirstname: string | null;
  ownerHandphone: string | null;
  ownerHomephone: string | null;
  ownerLastname: string | null;
  ownerRegnum: string | null;
  ownerType: string | null;
  ownerWorkphone: string | null;
  plateNumber: string | null;
  transmission: string | null;
  type: string | null;
  typeId: number;
  weight: number;
  wheelPosition: string | null;
  width: number;
};
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
  usage: number;
  @ApiProperty()
  lastname: string;
  @ApiProperty()
  firstname: string;
  @ApiProperty()
  org: string;
  @ApiProperty()
  platform: string;
  @ApiProperty()
  startDate?: Date;
  @ApiProperty()
  endDate?: Date;

  @ApiProperty({ enum: PaymentType })
  payment: number;
  @ApiProperty()
  value: Record<string, any>;
  status: number;
  @ApiProperty()
  vehicle: VehicleInfo;

  count?: number;
}
