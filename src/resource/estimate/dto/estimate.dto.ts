import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';
import { ObjectId } from 'mongodb';
import {
  AdSellType,
  AdStatus,
  AdTypes,
  AdView,
  EstimateStatus,
  ItemPosition,
  ItemTypes,
} from '../../../utils/enum';

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
  index?: number;
}
export const EstimateRequired = (dto: EstimateDto) => {
  const sub = new ObjectId(dto.subCategory);
  const cate = new ObjectId(dto.category);
  return (
    ObjectId.isValid(sub) &&
    ObjectId.isValid(cate) &&
    dto.file &&
    dto.items &&
    dto.items.length > 0
  );
};
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
