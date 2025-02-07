import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionService } from './transaction.service';
@ApiBearerAuth('access-token')
@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly transactionService: TransactionService,
  ) {}

  @Post()
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.create(createPaymentDto);
  }
  @Post('transaction')
  createTransaction(@Body() dto: CreateTransactionDto, @Request() { user }) {
    try {
      return this.transactionService.create({
        ...dto,
        user: user['email'],
      });
    } catch (error) {
      return {
        success: false,
        message: error.message,
        status: error.status,
      };
    }
  }

  @Get()
  findAll() {
    return this.paymentService.findAll();
  }

  @Get('user/:limit/:page')
  @ApiParam({ name: 'limit' })
  @ApiParam({ name: 'page' })
  findByUser(
    @Request() { user },
    @Param('limit') limit: string,
    @Param('page') page: string,
  ) {
    return this.paymentService.findByUser(user['id'], +limit, +page);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentService.update(+id, updatePaymentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentService.remove(+id);
  }
}
