import { Injectable } from '@nestjs/common';
import {
  Between,
  DataSource,
  In,
  IsNull,
  LessThan,
  MoreThan,
  Not,
  Repository,
} from 'typeorm';
import { ServiceEntity } from './entities/service.entity';
import { ServiceDto } from './dto/create-ad.dto';

@Injectable()
export class ServiceDao {
  private db: Repository<ServiceEntity>;
  constructor(private dataSource: DataSource) {
    this.db = this.dataSource.getRepository(ServiceEntity);
  }

  create = async (dto: ServiceDto, user: number) => {
    try {
      const res = await this.db.insert({
        ...dto,

        user: null,
        // {
        //   id: user,
        // },
      });
    } catch (error) {
      console.log(error);
    }
  };

  findAll = async () => {
    return await this.db.find({
      //   relations: [''],
    });
  };

  findOne = async (id: number) => {
    return await this.db.findOne({
      where: {
        id: id,
      },
      //   relations: ['level'],
    });
  };
  findByTypeAndUser = async (
    type: number,
    user: number,
    page: number,
    limit: number,
  ) => {
    return await this.db.find({
      where: {
        type: type,
        user: {
          id: user,
        },
      },
      take: limit,
      skip: (page - 1) * limit,
    });
  };
}
