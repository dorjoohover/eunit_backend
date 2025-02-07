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
    const user = await this.userService.getUser(dto.user as string);
    const remitterPoint = user.wallet + dto.point;
    let success = remitterPoint > 0;
    const date = new Date();
    const right = user.endDate > date;
    if (!success || right) {
      throw new HttpException(
        'Үлдэгдэл хүрэлцэхгүй байна.',
        HttpStatus.BAD_REQUEST,
      );
    }
    const res = await this.dao.create({
      ...dto,
      right: right,
      user: user.id,
    });
    await this.userService.updateUser(
      { ...user, wallet: remitterPoint },
      user.id,
    );
    return res.id;
  }

  public async updateRequest(id: number, request: number) {
    return await this.dao.update(id, request);
  }
}
