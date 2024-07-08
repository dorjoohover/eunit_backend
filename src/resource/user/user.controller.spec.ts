import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Ad,
  AdSchema,
  Feedback,
  FeedbackSchema,
  User,
  UserSchema,
} from '../../schema';
import { UserService } from './user.service';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection } from 'mongoose';
import { connect } from 'mongoose';

describe('UsersController', () => {
  let controller: UserController;
  let service: UserService;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      imports: [
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([
          { name: User.name, schema: UserSchema },
          { name: Ad.name, schema: AdSchema },
          { name: Feedback.name, schema: FeedbackSchema },
        ]),
      ],
      providers: [UserService],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
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
});
