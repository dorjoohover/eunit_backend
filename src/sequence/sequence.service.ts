import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/base/base.service';
import { SequenceDao } from './sequence.dao';
import { Utils } from 'src/common';

@Injectable()
export class SequenceService extends BaseService {
  constructor(private sequenceDao: SequenceDao) {
    super();
  }

  public async next(key: string, max: number) {
    let value = 1;
    try {
      const existing = await this.sequenceDao.get(key);
      if (existing.value >= max) {
        value = 1;
      } else {
        value = existing.value + 1;
      }
      await this.sequenceDao.update(key, value);
    } catch (err) {
      // if (err instanceof AppDBResultNotFoundException) {
      if (err) {
        await this.sequenceDao.add(key, value);
      } else {
        throw err;
      }
    }
    return value;
  }

  public async nextZeroPadded(key: string, length: number, max: number) {
    const value = await this.next(key, max);
    return Utils.zeroPadding(value, length);
  }
}
