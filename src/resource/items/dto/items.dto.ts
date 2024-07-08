import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { ItemPosition, ItemTypes } from '../../../utils/enum';

export class ItemDetailDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  value: string;

  @ApiProperty()
  parentId?: string;

  @ApiProperty()
  parent?: string;
}

export const ItemRequired = (dto: ItemDto) => {
  return (
    dto.index &&
    dto.name &&
    dto.position &&
    dto.type &&
    dto.types &&
    dto.value &&
    dto.value.length > 0
  );
};
export class ItemDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNumber()
  index: number;

  @ApiProperty({ isArray: true, type: ItemDetailDto })
  value: ItemDetailDto[];

  @ApiProperty({ enum: ItemTypes })
  types: ItemTypes;

  @ApiProperty()
  @IsString()
  type: string;
  @ApiProperty()
  parentId?: string;

  @ApiProperty({ enum: ItemPosition, default: ItemPosition.default })
  position: ItemPosition;

  @ApiProperty()
  other?: boolean;

  @ApiProperty({ default: false })
  isSearch: boolean;

  @ApiProperty({ default: true })
  isUse: boolean;
}
