import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  Query,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionService } from './transaction.service';
import { Public } from 'src/auth/guards/jwt/auth-guard';
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

  @Public()
  @Get('transactions/:all')
  @ApiQuery({ name: 'page' })
  @ApiQuery({ name: 'limit' })
  @ApiQuery({ name: 'payment' })
  @ApiQuery({ name: 'phone' })
  @ApiQuery({ name: 'email' })
  @ApiQuery({ name: 'service' })
  @ApiQuery({ name: 'date' })
  @ApiParam({ name: 'all' })
  findAll(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('payment') payment: number,
    @Query('phone') phone: string,
    @Query('email') email: string,
    @Query('service') service: number,
    @Query('status') status: number,
    @Query('date') date: string,
    @Param('all') all: number,
  ) {
    return this.transactionService.findAll(
      {
        page,
        limit,
        status,
        email,
        phone,
        payment,
        date,
        service,
      },
      all,
    );
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
