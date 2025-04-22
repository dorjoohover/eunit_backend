import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { RolesGuard } from './auth/guards/role/role.guard';
import { AllExceptionsFilter } from './common/all-exceptions.filter';
import { PostInterceptor } from './post.interceptor';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './app/user/user.module';
import { AuthModule } from './auth/auth.module';
import { BaseModule } from './base/base.module';
import { PaymentModule } from './app/payment/payment.module';
import { LocationModule } from './data/location/location.module';
import { AdModule } from './data/ad/ad.module';
import { DatabaseModule } from './database/database.module';
import { RequestModule } from './app/request/request.module';
import { AppExcel } from './common/app.excel';
import { AuthGuard } from './auth/guards/jwt/auth-guard';
import { EmailModule } from './auth/guards/email.module';
import { QpayModule } from './app/qpay/qpay.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    QpayModule,
    EmailModule,
    DatabaseModule,
    UserModule,
    AuthModule,
    BaseModule,
    PaymentModule,
    RequestModule,
    LocationModule,
    AdModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AppExcel,

    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: PostInterceptor,
    },
  ],
})
export class AppModule {}
