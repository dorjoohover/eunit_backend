import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserDao } from './user.dao';
import { BaseService } from 'src/base/base.service';
import { CreateUserDto } from './dto/create-user.dto';
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
      point: 20000,
      receiver: user,
      remitter: 5,
      message: 'Шинэ хэрэглэгчийн урамшуулал',
    });
  }

  findAll() {
    return `This action returns all user`;
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
    if (!res)
      throw new HttpException('Хэрэглэгч олдсонгүй', HttpStatus.NOT_FOUND);
    return res;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
