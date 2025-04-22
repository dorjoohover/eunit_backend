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

  update = async (dto: ServiceDto) => {
    try {
      const res = await this.db.findOne({
        where: {
          code: dto.code,
        },
      });
      await this.db.save({
        ...res,
        aggregations: dto.aggregations,
        burenOrtog: dto.burenOrtog,
        price: dto.price,
        elegdel: dto.elegdel,
        elegdelPercent: dto.elegdelPercent,
      });
    } catch (error) {
      console.log(error);
    }
  };

  create = async (dto: ServiceDto, user: number) => {
    try {
      const operation = new Date(dto.date).getFullYear();
      const res = await this.db.insert({
        ...dto,
        operation: operation,
        user: {
          id: user,
        },
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
    const res = await this.db.find({
      where: {
        type: type,
        user: {
          id: user,
        },
      },
      take: limit,
      skip: (page - 1) * limit,
    });
    const [d, count] = await this.db.findAndCount({
      where: {
        type,
        user: {
          id: user,
        },
      },
    });
    return {
      data: res,
      count: count,
    };
  };
}
