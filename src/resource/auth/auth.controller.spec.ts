import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Ad, AdSchema, User, UserSchema } from '../../schema';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, connect } from 'mongoose';
import { MailerModule, MailerService } from '@nestjs-modules/mailer';
import { EmailModule } from './email.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService, UserService, MailerService],
      imports: [
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([
          { name: Ad.name, schema: AdSchema },
          { name: User.name, schema: UserSchema },
        ]),
        MailerModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: async (config: ConfigService) => ({
            transport: {
              host: 'smtp.ethereal.email',
              port: 587,
              service: 'gmail',
              auth: {
                user: 'dorjoohover@gmail.com',
                pass: 'qwrn ysyk prkg iuls',
              },
            },
            defaults: {
              from: 'dorjoohover@gmail.com',
            },
          }),
        }),,
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
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
