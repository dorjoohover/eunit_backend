import { Module } from '@nestjs/common';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';
import { LocationDao } from './location.dao';
import { BaseService } from 'src/base/base.service';
import { SequenceModule } from 'src/sequence/sequence.module';
import { BaseModule } from 'src/base/base.module';
import { AdDao } from '../ad/ad.dao';

@Module({
  imports: [BaseModule, SequenceModule],
  controllers: [LocationController],
  providers: [LocationService, LocationDao, BaseService, AdDao],
  exports: [LocationService],
})
export class LocationModule {}
