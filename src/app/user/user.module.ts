import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserDao } from './user.dao';
import { BaseService } from 'src/base/base.service';
import { SequenceModule } from 'src/sequence/sequence.module';
import { BaseModule } from 'src/base/base.module';
import { TransactionDao } from '../payment/dao/transaction.dao';

@Module({
  imports: [BaseModule, SequenceModule],
  controllers: [UserController],
  providers: [UserService, UserDao, BaseService, TransactionDao],
  exports: [UserService],
})
export class UserModule {}
