import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { CLIENT } from 'src/base/constants';

@Injectable()
export class UserDao {
  private db: Repository<UserEntity>;
  constructor(private dataSource: DataSource) {
    this.db = this.dataSource.getRepository(UserEntity);
  }

  find = async () => {
    const res = await this.db.find();
    return res;
  };

  add = async (user: CreateUserDto) => {
    const res = this.db.create({
      ...user,
      role: user.role == undefined ? CLIENT : user.role,
      wallet: 20000,
    });
    await this.db.save(res);
    console.log(res.id);
    return res
  };

  updateUser = async (user: CreateUserDto, id: number) => {
    const res = await this.getUserInfo(id);
    await this.db.save({
      ...res,
      lastname: user.lastname ?? res.lastname,
      firstname: user.firstname ?? res.firstname,
      email: user.email ?? res.email,
      phone: user.phone ?? res.phone,
      wallet: user.wallet ?? res.wallet,
      profile: user.profile ?? res.phone,
    });
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

  getByEmail = async (email: string) => {
    return await this.db.findOne({
      where: {
        email: email,
      },
    });
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
