import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, DataSource, IsNull, Like, Not, Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto, UserFindDto } from './dto/create-user.dto';
import { CLIENT } from 'src/base/constants';

@Injectable()
export class UserDao {
  private db: Repository<UserEntity>;
  constructor(private dataSource: DataSource) {
    this.db = this.dataSource.getRepository(UserEntity);
  }

  async findAll() {
    return await this.db.find()
  }

  find = async (dto: UserFindDto) => {
    const where: Record<string, any> = {};
    if (dto.firstname) where.firstname = Like(`%${dto.firstname}%`);
    if (dto.lastname) where.lastname = Like(`%${dto.lastname}%`);
    if (dto.email) where.email = Like(`%${dto.email}%`);

    if (dto.phone) where.phone = Like(`%${dto.phone}%`);
    if (dto.date) {
      const startDate = new Date(dto.date);
      const endDate = new Date(startDate.setDate(startDate.getDate() + 1));
      where.createdAt = Between(new Date(dto.date), endDate);
    }
    const res = await this.db.findAndCount({
      where: where,
      take: dto.limit,
      skip: (dto.page - 1) * dto.limit,
      order: {
        createdAt: 'DESC',
      },
    });
    return {
      data: res[0],
      total: res[1],
      currentPage: dto.page ?? 1,
      totalPage: Math.ceil(res[1] / dto.limit),
    };
  };

  add = async (user: CreateUserDto) => {
    try {
      console.log(user);
      const u = await this.db.findOne({
        where: [
          {
            email: user.email,
          },
          {
            phone: user.phone,
          },
        ],
      });
      console.log(u);
      if (u) throw new HttpException('Бүртгэлтэй хэрэглэгч', 400);
      const res = this.db.create({
        ...user,
        role: user.role == undefined ? CLIENT : user.role,
        wallet: 2000,
      });
      await this.db.save(res);
      return res;
    } catch (error) {
      if (error.message?.includes('duplicate key value')) {
        throw new HttpException(
          'Бүртгэлтэй дугаар эсвэл имайл хаяг байна.',
          HttpStatus.CONFLICT,
        );
      }
      throw error;
    }
  };

  updateUser = async (user: CreateUserDto, id: number) => {
    const res = await this.getUserInfo(id);
    await this.db.update(id, {
      ...user,
    });
    // await this.db.save({
    //   ...res,
    //   lastname: user.lastname ?? res.lastname,
    //   firstname: user.firstname ?? res.firstname,
    //   email: user.email ?? res.email,
    //   phone: user.phone ?? res.phone,
    //   wallet: user.wallet ?? res.wallet,
    //   profile: user.profile ?? res.phone,
    // });
    return true;
  };
  changePassword = async (id: string, password: string, merchantId: string) => {
    // const builder = new SqlBuilder({ password }, ['password']);
    // const { cols, indexes } = builder.create();
    // const criteria = builder
    //   .condition('id', '=', id)
    //   .condition('merchantId', '=', merchantId)
    //   .criteria();
    // await this.db._update(
    //   `UPDATE "${tableName}" SET (${cols}) = ROW(${indexes}) ${criteria}`,
    //   builder.values,
    // );
  };

  getByEmail = async (phone: string) => {
    console.log(phone);
    let res = await this.db.findOne({
      where: {
        phone: phone,
      },
    });
    if (!res)
      res = await this.db.findOne({
        where: {
          email: phone,
        },
      });
    if (!res) {
      if (!isNaN(parseInt(phone))) {
        res = await this.db.findOne({
          where: {
            id: +phone,
          },
        });
      }
    }
    return res;
  };

  getUserInfo = async (id: any) => {
    return this.db.findOne({
      select: ['id', 'profile', 'role', 'wallet', 'email', 'name', 'birthdate'],
      where: {
        id: id,
      },
    });
  };

  //   list = async (filter: any): Promise<{ count: number; items: any[] }> => {
  //     const { builder, criteria } = this.buildCriteria(filter);
  //     const count = await this.db.count(
  //       `SELECT COUNT(1) FROM "${tableName}" ${criteria}`,
  //       builder.values,
  //     );
  //     const items = await this.db.select(
  //       `SELECT "id", "name", "username", "employeeCard", "role" FROM "${tableName}" ${criteria}
  //       order by "id" asc limit ${filter.limit} offset ${filter.skip}`,
  //       builder.values,
  //     );
  //     return { count, items };
  //   };

  //   buildCriteria(filter: any) {
  //     if (filter.endDate) {
  //       filter.endDate = new Date(parseInt(filter.endDate)).toISOString();
  //     }
  //     if (filter.startDate) {
  //       filter.startDate = new Date(parseInt(filter.startDate)).toISOString();
  //     }

  //     if (filter.name) {
  //       filter.name = `%${filter.name}%`;
  //     }

  //     if (filter.username) {
  //       filter.username = `%${filter.username}%`;
  //     }

  //     const builder = new SqlBuilder(filter);

  //     const criteria = builder
  //       .conditionIfNotEmpty('merchantId', '=', filter.merchantId)
  //       .conditionIfNotEmpty('name', 'ILIKE', filter.name)
  //       .conditionIfNotEmpty('username', 'ILIKE', filter.username)
  //       .conditionIfNotEmpty('employeeCard', '=', filter.employeeCard)
  //       .conditionIfNotEmpty('role', '=', filter.role)
  //       .conditionIfNotEmpty('createdAt', '>=', filter.startDate)
  //       .conditionIfNotEmpty('createdAt', '<=', filter.endDate)
  //       .criteria();

  //     return { builder, criteria };
  //   }

  //   get = async (username: any) => {
  //     return this.db.selectOne(
  //       `SELECT * FROM "${tableName}" WHERE lower("username")=lower($1)`,
  //       [username],
  //     );
  //   };
}
