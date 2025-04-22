import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { SequenceEntity } from './sequence.entity';

@Injectable()
export class SequenceDao {
  private db: Repository<SequenceEntity>;
  constructor(private dataSource: DataSource) {
    this.db = this.dataSource.getRepository(SequenceEntity);
  }
  add = async (key: string, value: number) => {
    const res = this.db.create({
      key: key,
      value: value,
    });
    await this.db.save(res);
  };

  update = async (key: string, value: number): Promise<number> => {
    const sequence = await this.db.save({
      key,
      ...{ key: key, value: value },
    });
    return sequence.value;
  };

  get = async (key: string) => {
    return await this.db.findOne({
      where: { key: key },
    });
  };
}
