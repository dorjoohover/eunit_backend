import { ApiProperty } from '@nestjs/swagger';
import { ParentProperty } from 'src/base/base.dto';
import { PaymentType } from 'src/base/constants';

export class RequetsFindDto {
  service?: number;
  user?: number;
  page: number;
  limit: number;
  phone?: string;
  email?: string;
  status?: number;
  date?: string;
}

export class CreateRequestDto {
  @ApiProperty()
  service: number;
  @ApiProperty()
  area: number;
  @ApiProperty()
  operation?: number;
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
