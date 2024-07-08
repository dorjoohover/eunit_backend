import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection } from 'mongoose';
import { CategoryController } from '../category.controller';
import { CategoryService } from '../category.service';
import { Category, CategorySchema, Item, ItemSchema } from '../../../schema';
import { ItemsService } from '../../items/items.service';
import {
  CategoryApartmentDtoStub,
  CategoryDtoStub,
  CategoryWrongDtoStub,
} from '../dto/category.stub';
import { CategoryDto } from '../dto/category.dto';
import {
  CategoryAlreadyExists,
  CategoryNotFound,
  CategoryWrongExists,
} from '../category.exits.exception';

describe('CategoryController (integration)', () => {
  let controller: CategoryController;
  let service: CategoryService;
  let itemService: ItemsService;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let parent;
  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([
          { name: Category.name, schema: CategorySchema },
          { name: Item.name, schema: ItemSchema },
        ]),
      ],
      controllers: [CategoryController],
      providers: [CategoryService, ItemsService],
    }).compile();

    controller = module.get<CategoryController>(CategoryController);
    service = module.get<CategoryService>(CategoryService);
    itemService = module.get<ItemsService>(ItemsService);
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
  it('should get error when creating category', async () => {
    const res = controller.createCategory(
      CategoryWrongDtoStub() as CategoryDto,
    );

    await expect(res).rejects.toThrow(CategoryWrongExists);
  });
  it('should create cateogory', async () => {
    const response = await controller.createCategory(CategoryDtoStub());
    parent = response.id;
    expect(response.success).toBe(true);
    expect(response.id).toBeDefined();
  });

  it('should get already exist when creating category ', async () => {
    
    const res1 = controller.createCategory(CategoryDtoStub());

    await expect(res1).rejects.toThrow(CategoryAlreadyExists);
  });

  it('should find all categories', async () => {
    // await controller.createCategory(CategoryDtoStub())
    const res = await controller.getAllCategories('false');
    expect(res.length).toBeGreaterThanOrEqual(1);
  });

  it('should get to find category by id | href ', async () => {
    const cate = await controller.createCategory({
      ...CategoryApartmentDtoStub(),
      parent: parent,
    });
    const res = await controller.getCategoryById(cate.id);

    expect(res.name).toBe(CategoryApartmentDtoStub().name);
    const res1 = await controller.getCategoryById(CategoryApartmentDtoStub().href)
    expect(res1.name).toBe(CategoryApartmentDtoStub().name)
  });

  it('should return null when find item by type and it is not found', async () => {
    // await controller.createCategory(CategoryDtoStub());
    const res = controller.getCategoryById('test');
    expect(res).rejects.toThrow(CategoryNotFound);
  });




  
});
