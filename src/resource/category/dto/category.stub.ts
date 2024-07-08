import { CreateAdSteps } from '../../../utils/enum';
import { CategoryDto } from './category.dto';

export const CategoryDtoStub = (): CategoryDto => {
  return {
    name: 'Үл хөдлөх',
    english: 'Real state',
    steps: [],
    subCategory: [],
    href: 'realState',
    suggestionItem: [],
    parent: null,
  };
};

export const CategoryEstimateDtoStub = (): CategoryDto => {
  return {
    name: 'Газрын эрхийн үнэлгээ',
    english: 'Realstate estimate land',
    parent: null,
    steps: [
      {
        step: CreateAdSteps.general,
        values: [],
      },
    ],

    href: 'estimateland',
    estimate: true,
  };
};

export const CategoryWrongDtoStub = (): CategoryDto => {
  return {
    steps: [],
    subCategory: [],
    href: 'realState',
    suggestionItem: [],
    parent: null,
  } as CategoryDto;
};

export const CategoryApartmentDtoStub = (): CategoryDto => {
  return {
    name: 'Орон сууц',
    english: 'Apartment',
    parent: '63f212d2742b202a77c109d5',
    href: 'apartment',
    steps: [
      {
        step: CreateAdSteps.location,
        values: [],
      },
      {
        step: CreateAdSteps.general,
        values: [],
      },
      {
        step: CreateAdSteps.detail,
        values: [],
      },
    ],
    suggestionItem: ['room', 'location'],
  };
};

export const CategoryLandDtoSub = (): CategoryDto => {
  return {
    name: 'Газар',
    parent: '63f212d2742b202a77c109d5',
    english: 'Land',
    href: 'land',
    steps: [
      {
        step: CreateAdSteps.location,
        values: [],
      },
      {
        step: CreateAdSteps.general,
        values: [],
      },
      {
        step: CreateAdSteps.detail,
        values: [],
      },
    ],
    suggestionItem: ['landUsage', 'location'],
  };
};
