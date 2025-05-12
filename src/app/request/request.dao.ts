import { Injectable } from '@nestjs/common';
import { DataSource, IsNull, Like, Not, Repository } from 'typeorm';
import { RequestEntity } from './entities/request.entity';
import { CreateRequestDto, RequetsFindDto } from './dto/create-request.dto';
import { PaymentStatus } from 'src/base/constants';

@Injectable()
export class RequestDao {
  private db: Repository<RequestEntity>;
  constructor(private dataSource: DataSource) {
    this.db = this.dataSource.getRepository(RequestEntity);
  }

  create = async (dto: CreateRequestDto) => {
    try {
      const res = this.db.create({
        ...dto,
        user: {
          id: dto.user,
        },
        location: {
          id: dto.location ? dto.location : null,
        },
      });
      await this.db.save(res);
      return res.id;
    } catch (error) {
      console.log(error);
    }
  };

  findAll = async () => {
    return await this.db.find();
    // const where = [];
    // if (dto.user) where.push({ user: { id: dto.user } });
    // if (dto.service) where.push({ service: dto.service });
    // if (dto.status) where.push({ status: dto.status });
    // if (dto.date) where.push({ createdAt: new Date(dto.date) });
    // if (dto.email) where.push({ user: { email: Like(`%${dto.email}%`) } });
    // if (dto.phone) where.push({ user: { phone: Like(`%${dto.phone}%`) } });
    // const res = await this.db.findAndCount({
    //   where: where,
    //   skip: (dto.page - 1) * dto.limit,
    //   relations: ['user', 'transactions'],
    //   take: dto.limit,
    //   order: {
    //     createdAt: 'desc',
    //   },
    // });
    // return {
    //   total: res[1],
    //   data: res[0],
    //   currentPage: dto.page,
    //   totalPage: Math.ceil(res[1] / dto.limit),
    // };
  };

  findAllUser = async (id: number) => {
    return await this.db.count({ where: { user: { id: id } } });
  };
  findByUser = async (id: number, page: number, limit: number) => {
    return await this.db.findAndCount({
      where: {
        user: {
          id: id,
        },
        status: PaymentStatus.SUCCESS,
      },
      relations: ['location'],
      take: limit,
      skip: (page - 1) * limit,
      order: {
        createdAt: 'desc',
      },
    });
  };

  updateCode = async (id: number, code: string) => {
    const res = await this.db.findOne({
      where: {
        id,
      },
    });
    res.code = code;
    await this.db.save(res);
  };

  updateResult = async (
    id: number,
    value: number,
    min?: number,
    max?: number,
  ) => {
    try {
      await this.db.update(id, {
        result: value,
        min: min ?? null,
        max: max ?? null,
      });
      return true;
    } catch (error) {
      return false;
    }
  };

  updateStatus = async (id: number, status: number) => {
    const res = await this.db.findOne({
      where: {
        id,
      },
    });
    res.status = status;
    await this.db.save(res);
  };

  findOne = async (id: number) => {
    return await this.db.findOne({
      where: {
        id: id,
      },
      relations: ['location', 'user'],
    });
  };
}
