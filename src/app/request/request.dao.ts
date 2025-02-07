import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { RequestEntity } from './entities/request.entity';
import { CreateRequestDto } from './dto/create-request.dto';

@Injectable()
export class RequestDao {
  private db: Repository<RequestEntity>;
  constructor(private dataSource: DataSource) {
    this.db = this.dataSource.getRepository(RequestEntity);
  }

  create = async (dto: CreateRequestDto) => {
    const res = this.db.create({
      ...dto,
      user: {
        id: dto.user,
      },
      location: {
        id: dto.location,
      },
    });
    await this.db.save(res);
    return res.id;
  };

  findAll = async () => {
    return await this.db.find({
      //   relations: [''],
    });
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
