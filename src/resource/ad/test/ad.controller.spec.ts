import { Test, TestingModule } from '@nestjs/testing';
import { AdController } from '../ad.controller';
import { AdService } from '../ad.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Ad,
  AdSchema,
  Category,
  CategorySchema,
  Item,
  ItemSchema,
  User,
  UserSchema,
} from '../../../schema';
import { CategoryService } from '../../category/category.service';
import { UserService } from '../../user/user.service';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection } from 'mongoose';
import { connect } from 'mongoose';
import {
  AdStatus,
  AdTypes,
  AdView,
  CreateAdSteps,
  UserType,
} from '../../../utils/enum';
import {
  AdDto1Stub,
  AdDto2Stub,
  AdDtoStub,
  AdDtoWrongStub,
} from '../dto/ad.dto.stub';
import { AdAlreadyExists, AdWrongExists } from '../ad.exists.exception';

describe('AdController', () => {
  let controller: AdController;
  let service: AdService;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;

  let user = {
    user: {
      _id: '6468e73ee15122dbb07a4364',
      point: 10000,
    },
  };
  let admin = {
    user: {
      _id: '6468e73ee15122dbb07a4365',
      userType: UserType.admin,
      point: 10000,
    },
  };
  let id;
  let createdAds = [];

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([
          { name: Ad.name, schema: AdSchema },
          { name: User.name, schema: UserSchema },
          { name: Item.name, schema: ItemSchema },
          { name: Category.name, schema: CategorySchema },
        ]),
      ],
      controllers: [AdController],
      providers: [AdService, CategoryService, UserService],
    }).compile();

    controller = module.get<AdController>(AdController);
    service = module.get<AdService>(AdService);
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
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  // create ad
  it('should create ad', async () => {
    const dto = AdDtoStub();
    let ad = await controller.ad(user, dto);
    id = ad.id;
    createdAds.push(ad.id);
    expect(ad.success).toBeTruthy();
    expect(ad.id).toBeDefined();
  });
  it('should exists already error create ad', async () => {
    const dto = AdDtoStub();
    let ad = controller.ad(user, dto);
    await expect(ad).rejects.toThrow(AdAlreadyExists);
  });
  it('should exist wrong params to create ad', async () => {
    const dto = AdDtoWrongStub();
    let ad = controller.ad(user, dto);
    await expect(ad).rejects.toThrow(AdWrongExists);
  });

  it('should create dummy data', async () => {
    const res = await controller.ad(user, AdDto1Stub());
    createdAds.push(res.id);
    const res1 = await controller.ad(user, AdDto2Stub());
    createdAds.push(res1.id);
  });

  it('should update ad status ', async () => {
    createdAds.map(async (id) => {
      const res = await controller.updateStatusAd(
        admin,
        '',
        id,
        AdView.show,
        AdStatus.created,
      );
      expect(res.success).toBeTruthy();
    });
  });

  it('should get ad', async () => {
    let res = await controller.getAllAds(1, 2, AdTypes.default, 0)
    expect(res.ads.length).toBeGreaterThanOrEqual(1)
  })



  // it('should get ad excel data', async () => {
  //   let res = await controller.getJsonAd(AdTypes.all)
  //   console.log(res)
  //   expect(res.length).toBeGreaterThanOrEqual(3)
  // })
});
