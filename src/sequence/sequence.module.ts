import { Module } from '@nestjs/common';
import { SequenceService } from './sequence.service';
import { SequenceDao } from './sequence.dao';
import { BaseModule } from 'src/base/base.module';
import { BaseService } from 'src/base/base.service';

@Module({
  imports: [BaseModule],
  providers: [SequenceService, SequenceDao, BaseService],
  exports: [SequenceService],
})
export class SequenceModule {}
