import { Injectable } from '@nestjs/common';
import { DataSource, IsNull, LessThan, Like, MoreThan, Not, Repository } from 'typeorm';
import { TransactionEntity } from '../entities/transaction.entity';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { RequetsFindDto } from 'src/app/request/dto/create-request.dto';

@Injectable()
export class TransactionDao {
  private db: Repository<TransactionEntity>;
  constructor(private dataSource: DataSource) {
    this.db = this.dataSource.getRepository(TransactionEntity);
  }

  find = async () => {
    const res = this.db.find();
    return res;
  };

  create = async (dto: CreateTransactionDto) => {
    const res = this.db.create({
      ...dto,
      user: {
        id: dto.user as number,
      },
      payment: dto.payment
        ? {
            id: dto.payment,
          }
        : null,
      request: dto.request
        ? {
            id: dto.request,
          }
        : null,
    });
    await this.db.save(res);
    return res;
  };
  findByUser = async (id: number, limit: number, page: number) => {
    const res = await this.db.findAndCount({
      where: [{ user: { id: id } }],
      relations: ['user'],
      order: {
        createdAt: 'DESC',
      },
      take: limit,
      skip: (page - 1) * limit,
    });
    return res;
  };

  findAll = async (dto: RequetsFindDto, all: boolean) => {
    const where: Record<string, any> = {}; // Ensure it's an object

    console.log('DTO Received:', dto);

    if (dto.user) {
      if (!where.user) where.user = {};
      where.user.id = dto.user;
    }

    if (dto.service) {
      if (!where.request) where.request = {};
      where.request.service = dto.service;
    }

    if (dto.status) {
      if (!where.request) where.request = {};
      where.request.status = dto.status;
    }

    if (dto.date) {
      where.createdAt = new Date(dto.date);
    }

    if (dto.email) {
      if (!where.user) where.user = {};
      where.user.email = Like(`%${dto.email}%`);
    }

    if (dto.phone) {
      if (!where.user) where.user = {};
      where.user.phone = Like(`%${dto.phone}%`);
    }

    console.log('Final WHERE Object:', JSON.stringify(where, null, 2));

    const [data, total] = await this.db.findAndCount({
      where: { ...where, point: all ? Not(IsNull()) : LessThan(0) },
      skip: (dto.page - 1) * dto.limit,
      take: dto.limit,
      relations: ['user', 'request'],
      order: { createdAt: 'desc' },
    });

    return {
      total,
      data,
      currentPage: dto.page,
      totalPage: Math.ceil(total / dto.limit),
    };
  };

  getTotalPrice = async (id?: number, method?: number) => {
    const query = this.db
      .createQueryBuilder('transaction')
      .select('SUM(transaction.point)', 'totalPrice');

    if (id !== undefined && id !== null && id !== 0) {
      query.where('transaction."userId" = :id', { id });
    }

    if (method !== undefined && method !== null && method !== 0) {
      query.andWhere('transaction."paymentType" = :method', { method });
    }

    query.groupBy('transaction."userId"');

    const res = await query.getRawMany();
    console.log(res);
    return res;
  };

  findByService = async (id: number) => {
    return await this.db.findOne({
      where: {
        request: {
          id,
        },
      },
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
  update = async (id: number, request: number) => {
    let res = await this.db.findOne({
      where: {
        id: id,
      },
    });
    res = await this.db.save({ ...res, request: { id: request } });
    return res;
  };
}
