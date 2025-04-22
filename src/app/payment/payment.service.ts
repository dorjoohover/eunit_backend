import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { BaseService } from 'src/base/base.service';
import { PaymentDao } from './dao/payment.dao';
import { TransactionDao } from './dao/transaction.dao';
import { RequetsFindDto } from '../request/dto/create-request.dto';

@Injectable()
export class PaymentService extends BaseService {
  constructor(
    private dao: PaymentDao,
    private transactionDao: TransactionDao,
  ) {
    super();
  }
  create(createPaymentDto: CreatePaymentDto) {
    return 'This action adds a new payment';
  }

  public async findByUser(id: number, limit: number, page: number) {
    return this.transactionDao.findByUser(id, limit, page);
  }

  findOne(id: number) {
    return `This action returns a #${id} payment`;
  }

  update(id: number, updatePaymentDto: UpdatePaymentDto) {
    return `This action updates a #${id} payment`;
  }

  remove(id: number) {
    return `This action removes a #${id} payment`;
  }
}
