import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection } from 'mongoose';
import { ItemsController } from '../items.controller';
import { ItemsService } from '../items.service';
import { Item, ItemSchema } from '../../../schema';
import { ItemsDTOStub, ItemsDTOStubError } from '../dto/items.dto.stub';
import { ItemDto } from '../dto/items.dto';
import {
  ItemsAlreadyExists,
  ItemsErrorExists,
  ItemsNotFound,
} from '../items.exists.exception';

describe('ItemsController (integration)', () => {
  let controller: ItemsController;
  let service: ItemsService;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([{ name: Item.name, schema: ItemSchema }]),
      ],
      controllers: [ItemsController],
      providers: [ItemsService],
    }).compile();

    controller = module.get<ItemsController>(ItemsController);
    service = module.get<ItemsService>(ItemsService);
  });

  afterAll(async () => {
    await mongoConnection.dropDatabase();
    await mongoConnection.close();
    await mongod.stop();
  });

  afterEach(async () => {
    const collections = mongoConnection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  });

  it('should get error when creating item ', async () => {
    const res = controller.create(ItemsDTOStubError() as ItemDto);

    await expect(res).rejects.toThrow(ItemsErrorExists);
  });
  it('should get error when creating item ', async () => {
    await controller.create(ItemsDTOStub());
    const res1 = controller.create(ItemsDTOStub());

    await expect(res1).rejects.toThrow(ItemsAlreadyExists);
  });
  it('should create item ', async () => {
    const response = await controller.create(ItemsDTOStub());
    expect(response.success).toBe(true);
    expect(response.id).toBeDefined();
  });

  it('should find all item', async () => {
    await controller.create(ItemsDTOStub())
    // const items = [ItemsDTOStub()]
    const res = await controller.getItems()
    expect(res.length).toBeGreaterThanOrEqual(1)
    
  })


  it('should get to find item by type ', async () => {
    await controller.create(ItemsDTOStub())
    const res = await controller.getByType(ItemsDTOStub().type)
    expect(res.name).toBe(ItemsDTOStub().name)
  })

  it('should return null when find item by type and it is not found', async () => {
    await controller.create(ItemsDTOStub())
    const res = controller.getByType('test')
    expect(res).rejects.toThrow(ItemsNotFound)
  })
});
