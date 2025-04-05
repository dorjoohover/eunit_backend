import { Module } from '@nestjs/common';
import { QpayController } from './qpay.controller';

@Module({
  controllers: [QpayController],
})
export class QpayModule {}
