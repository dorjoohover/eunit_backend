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
    const res = await this.transaction.create({
      point: 20000,
      receiver: user.id,
      remitter: 5,
      message: 'Шинэ хэрэглэгчийн урамшуулал',
    });
    return user;
  }

  public async changeWallet(dto: WalletUserDto, id: number) {
    const user = await this.userDao.getUserInfo(dto.email);
    await this.userDao.updateUser(
      {
        ...user,
        wallet: dto.wallet,
        role: dto.role,
      },
      user.id,
    );
    return await this.transaction.create({
      point: dto.wallet,
      remitter: id,
      receiver: user.id,
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
  async getUser(username: string) {
    const res = await this.userDao.getByEmail(username);
    // if (!res)
    //   throw new HttpException('Хэрэглэгч олдсонгүй', HttpStatus.NOT_FOUND);
    return res;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
