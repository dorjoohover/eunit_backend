import { Test, TestingModule } from '@nestjs/testing';
import { AdController } from './ad.controller';
import { AdService } from './ad.service';
import { ServiceService } from './service.service';
import { LocationDao } from '../location/location.dao';
import { ServiceDao } from './service.dao';

jest.mock('src/auth/guards/jwt/auth-guard', () => ({
  Public: () => () => undefined,
}));

describe('AdController', () => {
  let controller: AdController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdController],
      providers: [
        { provide: AdService, useValue: {} },
        { provide: ServiceService, useValue: {} },
        { provide: LocationDao, useValue: {} },
        { provide: ServiceDao, useValue: {} },
      ],
    }).compile();

    controller = module.get<AdController>(AdController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
