import { Test, TestingModule } from '@nestjs/testing';
import { AdService } from './ad.service';
import { AdDao } from './ad.dao';
import { ServiceDao } from './service.dao';
import { AppExcel } from 'src/common/app.excel';
import { LocationDao } from '../location/location.dao';

describe('AdService', () => {
  let service: AdService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdService,
        { provide: AdDao, useValue: {} },
        { provide: ServiceDao, useValue: {} },
        { provide: AppExcel, useValue: {} },
        { provide: LocationDao, useValue: {} },
      ],
    }).compile();

    service = module.get<AdService>(AdService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
