import { ItemPosition, ItemTypes } from '../../../utils/enum';
import { ItemDto } from './items.dto';

export const ItemsDTOStub = (): ItemDto => {
  return {
    name: 'Угаалгын өрөөний тоо',

    index: 2,

    value: [
      {
        id: 'none',
        value: 'Байхгүй',
      },
      {
        id: '1',
        value: '1',
      },
      {
        id: '2',
        value: '2',
      },
      {
        id: '2+',
        value: '2+',
      },
    ],

    types: ItemTypes.radio,

    type: 'bathroom',

    //   parentId?: string;

    position: ItemPosition.top,

    other: false,

    isSearch: true,

    isUse: true,
  };
};
export const ItemsDTOStubError = () => {
  return {
    // name: 'Угаалгын өрөөний тоо',

    index: 2,

    value: [
      {
        id: 'none',
        value: 'Байхгүй',
      },
      {
        id: '1',
        value: '1',
      },
      {
        id: '2',
        value: '2',
      },
      {
        id: '2+',
        value: '2+',
      },
    ],

    types: ItemTypes.radio,

    type: 'bathroom',

    //   parentId?: string;

    position: ItemPosition.top,

    other: false,

    isSearch: true,

    isUse: true,
  };
};
