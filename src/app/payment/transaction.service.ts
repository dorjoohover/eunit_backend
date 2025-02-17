import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { TransactionDao } from './dao/transaction.dao';
import { BaseService } from 'src/base/base.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UserService } from '../user/user.service';
import { PaymentType } from 'src/base/constants';

@Injectable()
export class TransactionService extends BaseService {
  constructor(
    private dao: TransactionDao,
    private userService: UserService,
  ) {
    super();
  }

  public async create(dto: CreateTransactionDto, add = true) {
    const user = await this.userService.getUser(dto.user as string);
    const date = new Date();
    const right = user.endDate > date;

    if (dto.paymentType == PaymentType.QPAY) {
      await this.userService.updateUser(
        { ...user, wallet: (user.wallet += dto.point * 0.1) },
        user.id,
      );
      await this.create(
        {
          point: dto.point * 0.1,
          user: dto.user,
          paymentType: PaymentType.LOYALTY,
          message: 'Худалдан авалтын урамшуулал',
        },
        false,
      );
      return (
        await this.dao.create({
          ...dto,
          point: -dto.point,
          right: right,
          user: user.id,
        })
      ).id;
    }
    const remitterPoint = user.wallet + dto.point;
    let success = remitterPoint > 0;

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
    if (add)
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
