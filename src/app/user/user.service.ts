import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserDao } from './user.dao';
import { BaseService } from 'src/base/base.service';
import { CreateUserDto, WalletUserDto } from './dto/create-user.dto';
import { TransactionDao } from '../payment/dao/transaction.dao';

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
      point: 3000,
      user: user.id,
      message: 'Шинэ хэрэглэгчийн урамшуулал',
    });
    return user;
  }

  public async changeWallet(dto: WalletUserDto, id: number) {
    const user = await this.userDao.getByEmail(dto.email);
    await this.userDao.updateUser(
      {
        ...user,
        wallet: dto.wallet,
      },
      user.id,
    );
    return await this.transaction.create({
      point: dto.wallet,
      user: id,
      message: 'Test',
    });
  }

  public async findAll() {
    return await this.userDao.find();
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
