import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { TransactionDao } from './dao/transaction.dao';
import { BaseService } from 'src/base/base.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class TransactionService extends BaseService {
  constructor(
    private dao: TransactionDao,
    private userService: UserService,
  ) {
    super();
  }

  public async create(dto: CreateTransactionDto) {
    const remitter = await this.userService.getUser(dto.remitter as string);
    const receiver = await this.userService.getUser(dto.receiver as string);
    const remitterPoint = remitter.wallet - dto.point;
    const receiverPoint = receiver.wallet + dto.point;
    let success = remitterPoint > 0 && receiverPoint > 0;
    const date = new Date();
    const right = remitter.endDate > date;
    if (!success || right) {
      throw new HttpException(
        'Үлдэгдэл хүрэлцэхгүй байна.',
        HttpStatus.BAD_REQUEST,
      );
    }
    const res = await this.dao.create({
      ...dto,
      right: right,
      remitter: remitter.id,
      receiver: receiver.id,
    });
    await this.userService.updateUser(
      { ...remitter, wallet: remitterPoint },
      remitter.id,
    );
    await this.userService.updateUser(
      { ...receiver, wallet: receiverPoint },
      receiver.id,
    );
    return res;
  }

  public async updateRequest(id: number, request: number) {
    return await this.dao.update(id, request);
  }
}
