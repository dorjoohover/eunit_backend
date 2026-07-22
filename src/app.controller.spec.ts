import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppExcel } from './common/app.excel';
import { AuthService } from './auth/auth.service';

jest.mock('./auth/auth.service', () => ({
  AuthService: class AuthService {},
}));

jest.mock('src/auth/guards/jwt/auth-guard', () => ({
  Public: () => () => undefined,
}));

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        { provide: AppService, useValue: {} },
        { provide: AppExcel, useValue: {} },
        { provide: AuthService, useValue: {} },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should be defined', () => {
      expect(appController).toBeDefined();
    });
  });
});
