import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';
import {
  AdSellType,
  AdStatus,
  AdTypes,
  AdView,
  ItemPosition,
  ItemTypes,
} from '../../../utils/enum';
import { ObjectId } from 'mongodb';

export class AdLocation {
  @ApiProperty()
  lng: string;
  @ApiProperty()
  lat: string;
}

export class AdFilterDto {
  @IsString()
  @ApiProperty()
  id: string;
  @ApiProperty()
  value?: string;
  @ApiProperty()
  min?: number;
  @ApiProperty()
  max?: number;
}

export class FilterDto {
  @ApiProperty({ isArray: true, type: AdFilterDto })
  @IsArray()
  items: AdFilterDto[];

  @ApiProperty({ isArray: true })
  sellTypes: string[];
  @ApiProperty()
  cateId: string;
}

export class AdItemDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  value: string;

  @ApiProperty({ enum: ItemPosition, default: ItemPosition.default })
  position: ItemPosition;

  @ApiProperty({ enum: ItemTypes })
  type: ItemTypes;

  @ApiProperty()
  index: number;

  @ApiProperty({ default: false })
  isSearch: boolean;
  @ApiProperty({ default: true })
  isUse: boolean;
}

export const AdRequired = (dto: AdDto) => {
  const sub = new ObjectId(dto.subCategory);
  const cate = new ObjectId(dto.category);
  return (
    dto.images &&
    dto.images.length > 0 &&
    dto.title &&
    dto.description &&
    dto.category &&
    ObjectId.isValid(sub) &&
    ObjectId.isValid(cate) &&
    dto.description &&
    dto.location &&
    dto.location.lat &&
    dto.location.lng
  );
};

export class AdDto {
  @ApiProperty({ maxLength: 100 })
  @IsString()
  title: string;

  // @ApiProperty()
  // unitPrice: number;
  // @ApiProperty()
  // area: number;
  @ApiProperty()
  @IsArray()
  images: string[];

  @ApiProperty({ maxLength: 1000 })
  description: string;

  @ApiProperty({ type: AdLocation })
  location: AdLocation;

  @ApiProperty()
  @IsString()
  subCategory: string;

  @ApiProperty()
  category: string;

  @ApiProperty({ enum: AdSellType })
  sellType: AdSellType;

  @ApiProperty({ isArray: true })
  items: AdItemDto[];

  @ApiProperty({ enum: AdTypes, default: AdTypes.default })
  adType: AdTypes;

  @ApiProperty({ enum: AdStatus, default: AdStatus.pending })
  adStatus: AdStatus;

  @ApiProperty({ enum: AdView })
  view: AdView;
  @ApiProperty()
  image?: string;

  @ApiProperty()
  file?: string;
}
export class AdDataDto {
  @ApiProperty({ maxLength: 100 })
  @IsString()
  title: string;

  @ApiProperty({ maxLength: 1000 })
  description: string;

  @ApiProperty({ type: AdLocation })
  location: AdLocation;

  @ApiProperty()
  @IsString()
  subCategory: string;
  @ApiProperty()
  @IsString()
  date: string;

  @ApiProperty()
  category: string;

  @ApiProperty({ enum: AdSellType })
  sellType: AdSellType;

  @ApiProperty({ isArray: true })
  items: AdItemDto[];

  @ApiProperty({ enum: AdTypes, default: AdTypes.default })
  adType: AdTypes;

  @ApiProperty({ enum: AdStatus, default: AdStatus.pending })
  adStatus: AdStatus;

  @ApiProperty({ enum: AdView })
  view: AdView;
  @ApiProperty()
  image?: string;

  @ApiProperty()
  file?: string;
}
