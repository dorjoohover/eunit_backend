import { Module } from '@nestjs/common';
import { RequestService } from './request.service';
import { RequestController } from './request.controller';
import { RequestDao } from './request.dao';
import { AdService } from 'src/data/ad/ad.service';
import { TransactionService } from '../payment/transaction.service';
import { AdDao } from 'src/data/ad/ad.dao';
import { AppExcel } from 'src/common/app.excel';
import { LocationDao } from 'src/data/location/location.dao';
import { TransactionDao } from '../payment/dao/transaction.dao';
import { UserService } from '../user/user.service';
import { UserDao } from '../user/user.dao';
import { ServiceDao } from 'src/data/ad/service.dao';
import { QpayService } from '../payment/qpay.service';
import { HttpModule, HttpService } from '@nestjs/axios';
import { PdfService } from './pdf';
import { RealstatePdf } from './pdf/realstate';
import { MailerService } from '@nestjs-modules/mailer';
import { CarsService } from './cars/cars.service';

@Module({
  imports: [HttpModule],
  controllers: [RequestController],
  providers: [
    RequestService,
    AdService,
    TransactionService,
    RequestDao,
    AdDao,
    LocationDao,
    TransactionDao,
    ServiceDao,
    UserService,
    UserDao,
    PdfService,
    AppExcel,
    RealstatePdf,
    QpayService,
    CarsService,
    // MailerService,
  ],
})
export class RequestModule {}
