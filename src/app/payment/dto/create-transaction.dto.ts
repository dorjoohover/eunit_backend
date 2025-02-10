import { ApiProperty } from '@nestjs/swagger';
import { ParentProperty } from 'src/base/base.dto';

export class CreateTransactionDto {
  @ApiProperty()
  point: number;
  @ApiProperty()
  user: number | string;
  @ApiProperty()
  request?: number;
  @ApiProperty()
  payment?: number;
  @ApiProperty()
  paymentType?: number;
  @ApiProperty()
  message?: string;
  @ApiProperty()
  right?: boolean;
}
