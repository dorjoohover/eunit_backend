import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';
import {
  AdSellType,
  AdStatus,
  AdTypes,
  AdView,
  ItemPosition,
  ItemTypes,
} from 'src/utils/enum';

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
  types: string[];
  @ApiProperty()
  cateId: string;
}

export class AdItemDto {
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

export class AdDto {
  @ApiProperty({ maxLength: 100 })
  @IsString()
  title: string;

  @ApiProperty()
  @IsArray()
  images: [];

  @ApiProperty({ maxLength: 1000 })
  description: string;

  @ApiProperty({ type: AdLocation })
  location: AdLocation;

  @ApiProperty()
  @IsString()
  subCategory: string;

  @ApiProperty()
  @IsString()
  category: string;

  @ApiProperty({ enum: AdSellType })
  sellType: AdSellType;

  @ApiProperty({ isArray: true })
  items: AdItemDto[];

  @ApiProperty({ enum: AdTypes, default: AdTypes.default })
  adType: AdTypes;

  @ApiProperty({ enum: AdStatus, default: AdStatus.pending })
  adStatus: AdStatus;

  @ApiProperty()
  image?: string;

  @ApiProperty()
  file?: string;

  @ApiProperty({ enum: AdView })
  view: AdView;
}
