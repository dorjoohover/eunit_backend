import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { TransactionDao } from './dao/transaction.dao';
import { BaseService } from 'src/base/base.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UserService } from '../user/user.service';
import { PaymentType } from 'src/base/constants';
import { RequetsFindDto } from '../request/dto/create-request.dto';

@Injectable()
export class TransactionService extends BaseService {
  constructor(
    private dao: TransactionDao,
    private userService: UserService,
  ) {
    super();
  }
  async findAll(dto: RequetsFindDto, all: number) {
    return await this.dao.findAll(dto, all);
  }

  public async findOneByRequest(id: number) {
    return await this.dao.findOne(id);
  }
  public async create(dto: CreateTransactionDto) {
    try {
      const user = await this.userService.getUser(dto.user as string);
      const date = new Date();
      const right = user.endDate > date;
      if (dto.paymentType == PaymentType.QPAY) {
        await this.dao.create({
          point: dto.point * 0.1,
          user: dto.user,
          paymentType: PaymentType.LOYALTY,
          request: dto.request,
          message: 'Худалдан авалтын урамшуулал',
        });

        const transaction = await this.dao.create({
          ...dto,
          point: -dto.point,
          right: right,
          request: dto.request,
          user: user.id,
        });
        return transaction.id;
      }
      const remitterPoint = user.wallet + dto.point;
      let success = remitterPoint >= 0;

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
    } catch (error) {
      console.log(error);
    }
  }

  public async updateRequest(id: number, request: number) {
    return await this.dao.update(id, request);
  }
}
