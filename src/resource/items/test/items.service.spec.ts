import { Model } from 'mongoose';
import { ItemsService } from '../items.service';
import { Item } from '../../../schema';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ItemsDTOStub, ItemsDTOStubError } from '../dto/items.dto.stub';
import { ItemDto } from '../dto/items.dto';
import {
  ItemsErrorExists,
} from '../items.exists.exception';
const mockItemModel = {
  find: jest.fn().mockReturnThis(),
  create: jest.fn(),
  exec: jest.fn(),
  findOne: jest.fn(),
  findById: jest.fn(),
  updateOne: jest.fn(),
};



describe('ItemsService', () => {
  let service: ItemsService;
  let model: Model<Item>;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItemsService,
        {
          provide: getModelToken(Item.name),
          useValue: mockItemModel,
        },
      ],
    }).compile();

    service = module.get<ItemsService>(ItemsService);
    model = module.get<Model<Item>>(getModelToken(Item.name));
  });
  const addValues = (res) => {
    

    jest.spyOn(model, 'create').mockImplementation((a) => a as any);

    res.map(async (r) => await service.createItem(r));

}

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should be create item', async () => {
    const item = ItemsDTOStub();

    jest.spyOn(model, 'create').mockImplementation(() => item as any);
    expect((await service.createItem(item)).success).toBeTruthy();
  });
  it('should be create item return error exists', async () => {
    const item = ItemsDTOStubError();
    jest.spyOn(model, 'create').mockImplementation(() => item as any);
    await expect(service.createItem(item as ItemDto)).rejects.toThrow(
      ItemsErrorExists,
    );
  });

  it('should find all items', async () => {
    const res = [ItemsDTOStub()];
    addValues(res);
    jest.spyOn(model, 'find').mockImplementationOnce(() => res as any);

    expect(await service.findAll()).toBe(res);

    //   model.find().exec().
  });

  it('should find by type', async () => {
    const res = [ItemsDTOStub()];
    addValues(res);
    jest.spyOn(model, 'findOne').mockImplementationOnce(() => res[0] as any);
    const r = await service.findByType(res[0].type);
    expect(r.name).toBe(res[0].name);
  });
  
  
});
