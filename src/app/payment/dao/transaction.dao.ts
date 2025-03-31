import { Injectable } from '@nestjs/common';
import { DataSource, Like, MoreThan, Repository } from 'typeorm';
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
    const where: any = {}; // Use an object instead of an array

    console.log(dto, all);

    if (dto.user) where.user = { id: dto.user };
    if (!all) where.point = MoreThan(0);
    if (dto.service) where.request = { ...where.request, service: dto.service };
    if (dto.status) where.request = { ...where.request, status: dto.status };
    if (dto.date) where.createdAt = new Date(dto.date);
    if (dto.email)
      where.user = { ...where.user, email: Like(`%${dto.email}%`) };
    if (dto.phone)
      where.user = { ...where.user, phone: Like(`%${dto.phone}%`) };

    console.log(where); // Debugging output

    const [data, total] = await this.db.findAndCount({
      where,
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
