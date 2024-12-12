import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { TransactionEntity } from '../entities/transaction.entity';
import { CreateTransactionDto } from '../dto/create-transaction.dto';

@Injectable()
export class TransactionDao {
  private db: Repository<TransactionEntity>;
  constructor(private dataSource: DataSource) {
    this.db = this.dataSource.getRepository(TransactionEntity);
  }

  create = async (dto: CreateTransactionDto) => {
    const res = this.db.create({
      ...dto,
      receiver: {
        id: dto.receiver as number,
      },
      remitter: {
        id: dto.remitter as number,
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
      where: [{ remitter: { id: id } }, { receiver: { id: id } }],
      relations: ['remitter', 'receiver'],
      order: {
        createdAt: 'DESC',
      },
      take: limit,
      skip: (page - 1) * limit,
    });
    return res;
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
