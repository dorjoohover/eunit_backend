import { Controller, Get, Query } from '@nestjs/common';

@Controller('qpay')
export class QpayController {
  @Get('callback')
  handleCallback(@Query('qpay_payment_id') qpayPaymentId: string) {
    console.log('Received callback with payment ID:', qpayPaymentId);
    return { message: 'Callback received', qpayPaymentId };
  }
}
