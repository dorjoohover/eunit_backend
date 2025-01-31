import { Module } from '@nestjs/common';
import { AdService } from './ad.service';
import { AdController } from './ad.controller';
import { AdDao } from './ad.dao';
import { BaseService } from 'src/base/base.service';
import { BaseModule } from 'src/base/base.module';
import { SequenceModule } from 'src/sequence/sequence.module';
import { AppExcel } from 'src/common/app.excel';
import { LocationDao } from '../location/location.dao';
import { ServiceDao } from './service.dao';
import { ServiceService } from './service.service';

@Module({
  imports: [BaseModule, SequenceModule],
  controllers: [AdController],
  providers: [
    AdService,
    AdDao,
    BaseService,
    ServiceService,
    ServiceDao,
    AppExcel,
    LocationDao,
  ],
  exports: [AdService, AdDao],
})
export class AdModule {}
