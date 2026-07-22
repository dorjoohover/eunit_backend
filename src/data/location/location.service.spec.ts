import { Test, TestingModule } from '@nestjs/testing';
import { LocationService } from './location.service';
import { LocationDao } from './location.dao';
import { AdDao } from '../ad/ad.dao';

describe('LocationService', () => {
  let service: LocationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationService,
        { provide: LocationDao, useValue: {} },
        { provide: AdDao, useValue: {} },
      ],
    }).compile();

    service = module.get<LocationService>(LocationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
