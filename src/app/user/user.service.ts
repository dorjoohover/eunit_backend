import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserDao } from './user.dao';
import { BaseService } from 'src/base/base.service';
import {
  CreateUserDto,
  UserFindDto,
  WalletUserDto,
} from './dto/create-user.dto';
import { TransactionDao } from '../payment/dao/transaction.dao';
import { PaymentType } from 'src/base/constants';

@Injectable()
export class UserService extends BaseService {
  constructor(
    private userDao: UserDao,
    private transaction: TransactionDao,
  ) {
    super();
  }
  public async create(dto: CreateUserDto) {
    const user = await this.userDao.add(dto);
    await this.transaction.create({
      point: 2000,
      user: user.id,
      message: 'Шинэ хэрэглэгчийн урамшуулал',
      paymentType: PaymentType.LOYALTY,
    });
    return user;
  }

  public async changeWallet(dto: WalletUserDto, id: number) {
    const user = await this.userDao.getByEmail(dto.email);
    await this.userDao.updateUser(
      {
        ...user,
        wallet: +user.wallet + +dto.wallet,
      },
      user.id,
    );
    return await this.transaction.create({
      point: dto.wallet,
      user: id,
      message: dto.message ?? 'Test',
    });
  }

  public async all() {
    return await this.userDao.findAll()
  }

  public async findAll(dto: UserFindDto) {
    const res = await this.userDao.find(dto);
    let { data, ...body } = res;
    data = await Promise.all(
      data.map(async (d) => {
        const response = await this.transaction.getTotalPrice(d.id, dto.method);
        const totalPrice = response?.[0]?.totalPrice ?? '0';
        return {
          ...d,
          totalPrice: +totalPrice,
        };
      }),
    );
    return {
      data,
      ...body,
    };
  }

  public async updateUser(user: CreateUserDto, id: number) {
    return await this.userDao.updateUser(
      {
        ...user,
      },
      id,
    );
  }
  async getUser(phone: string) {
    let res = await this.userDao.getByEmail(phone);
    return res;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
