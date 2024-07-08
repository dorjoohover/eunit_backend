import {
  AdSellType,
  EstimateStatus,
  ItemTypes,
} from '../../../utils/enum';
import { EstimateDto } from './estimate.dto';

export const EstimateDtoStub = (): EstimateDto => {
  return {
    sellType: AdSellType.sell,
    category: '6468e73ee15122dbb07a4364',
    status: EstimateStatus.pending,
    items: [
      {
        id: 'phone',
        name: 'Утасны дугаар',
        value: '95992333',
        type: ItemTypes.number,
      },
      {
        id: 'email',
        name: 'Цахим хаяг',
        value: 'suhele.baagii@gmail.com',
        type: ItemTypes.text,
      },
    ],
    subCategory: '6468e73ee15122dbb07a4364',
    file: 'test',
  };
};
export const EstimateWrongCategoryDtoStub = (): EstimateDto => {
  return {
    sellType: AdSellType.sell,
    category: '',
    status: EstimateStatus.pending,
    items: [
      {
        id: 'phone',
        name: 'Утасны дугаар',
        value: '95992333',
        type: ItemTypes.number,
      },
      {
        id: 'email',
        name: 'Цахим хаяг',
        value: 'suhele.baagii@gmail.com',
        type: ItemTypes.text,
      },
    ],
    subCategory: '',
    file: '',
  };
};

export const EstimateWrongDtoStub = (): EstimateDto => {
  return {
    sellType: AdSellType.sell,
    status: EstimateStatus.pending,
    items: [
      {
        id: 'phone',
        name: 'Утасны дугаар',
        value: '95992333',
        type: ItemTypes.number,
      },
      {
        id: 'email',
        name: 'Цахим хаяг',
        value: 'suhele.baagii@gmail.com',
        type: ItemTypes.text,
      },
    ],
  } as EstimateDto;
};
