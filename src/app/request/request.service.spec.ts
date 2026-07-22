import { Test, TestingModule } from '@nestjs/testing';
import { RequestService } from './request.service';
import { RequestDao } from './request.dao';
import { AdService } from 'src/data/ad/ad.service';
import { LocationDao } from 'src/data/location/location.dao';
import { TransactionService } from '../payment/transaction.service';
import { QpayService } from '../payment/qpay.service';
import { PdfService } from './pdf';
import { MailerService } from '@nestjs-modules/mailer';
import { CarsService } from './cars/cars.service';

jest.mock('./pdf', () => ({
  PdfService: class PdfService {},
}));

describe('RequestService', () => {
  let service: RequestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestService,
        { provide: RequestDao, useValue: {} },
        { provide: AdService, useValue: {} },
        { provide: LocationDao, useValue: {} },
        { provide: TransactionService, useValue: {} },
        { provide: QpayService, useValue: {} },
        { provide: PdfService, useValue: {} },
        { provide: MailerService, useValue: {} },
        { provide: CarsService, useValue: {} },
      ],
    }).compile();

    service = module.get<RequestService>(RequestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
