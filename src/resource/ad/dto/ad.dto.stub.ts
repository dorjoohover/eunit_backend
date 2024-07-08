import {
  AdSellType,
  AdStatus,
  AdTypes,
  AdView,
  CreateAdSteps,
  ItemPosition,
  ItemTypes,
} from '../../../utils/enum';
import { AdDto } from './ad.dto';

export const AdDtoStub = (): AdDto => {
  return {
    title: 'Үл хөдлөх',
    description: 'Real state',
    images: ['adsf.adf', 'asdf.adsf'],
    location: {
      lat: '47.9156287254497',
      lng: '106.91864490509033',
    },
    category: '63fc394e49677e486b77f002',
    subCategory: '63fc394e49677e486b77f002',
    sellType: AdSellType.sell,
    items: [
      {
        name: '',
        id: 'disctrict',
        value: 'Баянгол',
        position: ItemPosition.location,
        type: ItemTypes.dropdown,
        index: 0,
        isSearch: true,
        isUse: true,
      },
      {
        name: 'Үнэ',
        id: 'price',
        value: '1324123',
        position: ItemPosition.side,
        type: ItemTypes.text,
        index: 0,
        isSearch: false,
        isUse: true,
      },
    ],
    adType: AdTypes.default,
    adStatus: AdStatus.pending,
    view: AdView.hide,
  };
};

export const AdDto1Stub = (): AdDto => {
  return {
    title: 'Үл хөдлөх 1',
    description: 'Real state',
    images: ['adsf.adf', 'asdf.adsf'],
    location: {
      lat: '47.9156287254497',
      lng: '106.91864490509033',
    },
    category: '63fc394e49677e486b77f002',
    subCategory: '63fc394e49677e486b77f002',
    sellType: AdSellType.sell,
    items: [
      {
        name: '',
        id: 'disctrict',
        value: 'Баянгол',
        position: ItemPosition.location,
        type: ItemTypes.dropdown,
        index: 0,
        isSearch: true,
        isUse: true,
      },
      {
        name: 'Үнэ',
        id: 'price',
        value: '1324123',
        position: ItemPosition.side,
        type: ItemTypes.text,
        index: 0,
        isSearch: false,
        isUse: true,
      },
    ],
    adType: AdTypes.default,
    adStatus: AdStatus.pending,
    view: AdView.hide,
  };
};

export const AdDto2Stub = (): AdDto => {
  return {
    title: 'Үл хөдлөх 2',
    description: 'Real state',
    images: ['adsf.adf', 'asdf.adsf'],
    location: {
      lat: '47.9156287254497',
      lng: '106.91864490509033',
    },
    category: '63fc394e49677e486b77f002',
    subCategory: '63fc394e49677e486b77f002',
    sellType: AdSellType.sell,
    items: [
      {
        name: '',
        id: 'disctrict',
        value: 'Баянгол',
        position: ItemPosition.location,
        type: ItemTypes.dropdown,
        index: 0,
        isSearch: true,
        isUse: true,
      },
      {
        name: 'Үнэ',
        id: 'price',
        value: '1324123',
        position: ItemPosition.side,
        type: ItemTypes.text,
        index: 0,
        isSearch: false,
        isUse: true,
      },
    ],
    adType: AdTypes.default,
    adStatus: AdStatus.pending,
    view: AdView.hide,
  };
};
export const AdDtoWrongStub = (): AdDto => {
  return {
    title: 'Үл хөдлөх',
    description: 'Real state',
    images: [],
    location: {
      lat: '47.9156287254497',
      lng: '106.91864490509033',
    },
    category: '63fc394e49677e486b77f002',
    subCategory: '63fc394e49677e486b77f002',
    sellType: AdSellType.sell,
    items: [
      {
        name: '',
        id: 'disctrict',
        value: 'Баянгол',
        position: ItemPosition.location,
        type: ItemTypes.dropdown,
        index: 0,
        isSearch: true,
        isUse: true,
      },
      {
        name: 'Үнэ',
        id: 'price',
        value: '1324123',
        position: ItemPosition.side,
        type: ItemTypes.text,
        index: 0,
        isSearch: false,
        isUse: true,
      },
    ],
    adType: AdTypes.default,
    adStatus: AdStatus.pending,
    view: AdView.hide,
  };
};
