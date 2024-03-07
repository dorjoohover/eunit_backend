import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';
import {
  AdSellType,
  AdStatus,
  AdTypes,
  AdView,
  EstimateStatus,
  ItemPosition,
  ItemTypes,
} from 'src/utils/enum';

export class EstimateItemDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  value: string;
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ enum: ItemTypes })
  type: ItemTypes;

  @ApiProperty()
  index: number;
}

export class EstimateDto {
  @ApiProperty()
  @IsString()
  subCategory: string;

  @ApiProperty()
  @IsString()
  category: string;

  @ApiProperty({ enum: AdSellType })
  sellType: AdSellType;

  @ApiProperty({ isArray: true })
  items: EstimateItemDto[];

  @ApiProperty({ enum: EstimateStatus, default: EstimateStatus.pending })
  status: EstimateStatus;

  @ApiProperty()
  file?: string;

}
