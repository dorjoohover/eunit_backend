import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from '../category.service';
import { Model } from 'mongoose';
import { Category, Item } from '../../../schema';
import { getModelToken } from '@nestjs/mongoose';
import { CategoryDtoStub } from '../dto/category.stub';

const mockCategoryModel = {
  find: jest.fn().mockReturnThis(),
  create: jest.fn(),
  exec: jest.fn(),
  findOne: jest.fn(),
  findById: jest.fn(),
  updateOne: jest.fn(),
};
const mockItemModel = {
  
  find: jest.fn().mockReturnThis(),
  create: jest.fn(),
  exec: jest.fn(),
  findOne: jest.fn(),
  findById: jest.fn(),
  updateOne: jest.fn(),
}
describe('CategoryService', () => {
  let service: CategoryService;
  let model: Model<Category>;
  let itemModel: Model<Item>
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: getModelToken(Category.name),
          useValue: mockCategoryModel,
        },
        {
          provide: getModelToken(Item.name),
          useValue: mockItemModel
        }
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    model = module.get<Model<Category>>(getModelToken(Category.name))
    itemModel = module.get<Model<Item>>(getModelToken(Item.name))
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  const addValues = (res) => {
    jest.spyOn(model, 'create').mockImplementation((a) => a as any);

    res.map(async (r) => await service.createCategory(r));
  };

  it('should be create category', async () => {
    const cate = CategoryDtoStub();

    jest.spyOn(model, 'create').mockImplementation(() => cate as any);
    expect((await service.createCategory(cate)).success).toBeTruthy();
  });
});
