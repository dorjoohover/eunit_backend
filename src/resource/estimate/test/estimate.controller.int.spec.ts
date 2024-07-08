import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection } from 'mongoose';
import {
  Category,
  CategorySchema,
  Estimate,
  EstimateSchema,
  Item,
  ItemSchema,
  User,
  UserSchema,
} from '../../../schema';
import { EstimateController } from '../estimate.controller';
import { EstimateService } from '../estimate.service';
import { EstimateDtoStub, EstimateWrongDtoStub } from '../dto/estimate.stub';
import { EstimateDto } from '../dto/estimate.dto';
import {
  EstimateNotFound,
  EstimateWrongExists,
} from '../estimate.exist.exception';
import { EstimateStatus, UserType } from '../../../utils/enum';
import { ForbiddenException } from '@nestjs/common';
import { CategoryService } from '../../category/category.service';
import { UserService } from '../../user/user.service';

describe('EstimateController (integration)', () => {
  let controller: EstimateController;
  let service: EstimateService;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let user = {
    user: {
      _id: '6468e73ee15122dbb07a4364',
    },
  };
  let admin = {
    user: {
      _id: '6468e73ee15122dbb07a4365',
      userType: UserType.admin,
    },
  };
  let id;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([
          { name: Estimate.name, schema: EstimateSchema },
          { name: Category.name, schema: CategorySchema },
          { name: User.name, schema: UserSchema },
          { name: Item.name, schema: ItemSchema },
        ]),
      ],
      controllers: [EstimateController],
      providers: [EstimateService, CategoryService, UserService],
    }).compile();

    controller = module.get<EstimateController>(EstimateController);
    service = module.get<EstimateService>(EstimateService);
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
  it('should error when creating estimate', async () => {
    const res = controller.createEstimate(
      user,
      EstimateWrongDtoStub() as EstimateDto,
    );

    await expect(res).rejects.toThrow(EstimateWrongExists);
  });
  it('should create estimate', async () => {
    const response = await controller.createEstimate(user, EstimateDtoStub());
    id = response.id;
    expect(response.success).toBe(true);
    expect(response.id).toBeDefined();
  });

  it('should find all estimate', async () => {
    // await controller.createCategory(CategoryDtoStub())
    const res = await controller.getEstimate(admin, EstimateStatus.pending);
    expect(res.length).toBeGreaterThanOrEqual(1);
  });

  it('should get to find estimate by user', async () => {
    const res = await controller.getEstimateUser(user);

    expect(res.length).toBeGreaterThanOrEqual(1);
  });
  it('should exists to not found to find estimate by user', async () => {
    const res = controller.getEstimateUser(admin);
    await expect(res).rejects.toThrow(EstimateNotFound);
  });
  it('update status of estimate', async () => {
    const res = await controller.updateStatusEstimate(
      EstimateStatus.estimated,
      id,
    );
    expect(res.success).toBe(true);
  });

  it('exists not found when update status of estimate', async () => {
    const res = controller.updateStatusEstimate(
      EstimateStatus.estimated,
      user.user._id,
    );
    await expect(res).rejects.toThrow(EstimateNotFound);
  });

  it('update price of estimate by admin', async () => {
    const res = await controller.updatePrice(admin, id, 10000);
    expect(res.success).toBeTruthy();
  });
  // it('update price of estimate by user then give error', async () => {
  //   const res = controller.updatePrice(user, id, 10000);
  //   await expect(res).rejects.toThrow(ForbiddenException);
  // });

  it('should update message and status using id by admin', async () => {
    // await controller.createCategory(CategoryDtoStub());
    const res = await controller.updateEstimate(
      { message: 'test' },
      id,
      EstimateStatus.returned,
    );
    expect(res.success).toBeTruthy();
  });
  it('delete estimate ', async () => {
    const res = await controller.deleteEstimate(user, id);
    expect(res.success).toBeTruthy();
  });
});
