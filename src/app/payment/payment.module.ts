import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PaymentDao } from './dao/payment.dao';
import { TransactionDao } from './dao/transaction.dao';
import { BaseService } from 'src/base/base.service';
import { SequenceModule } from 'src/sequence/sequence.module';
import { BaseModule } from 'src/base/base.module';
import { TransactionService } from './transaction.service';
import { UserService } from '../user/user.service';
import { UserDao } from '../user/user.dao';
import { QpayService } from './qpay.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [BaseModule, HttpModule, SequenceModule],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    PaymentDao,
    TransactionDao,
    BaseService,
    TransactionService,
    UserService,
    UserDao,
    QpayService,
  ],
})
export class PaymentModule {}
