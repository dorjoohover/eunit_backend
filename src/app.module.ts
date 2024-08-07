import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import appConfig from './config/app.config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './resource/auth/auth.module';
import { AdModule } from './resource/ad/ad.module';
import { UserModule } from './resource/user/user.module';
import { ItemsModule } from './resource/items/items.module';

import { EstimateModule } from './resource/estimate/estimate.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { MulterModule } from '@nestjs/platform-express';
import { CategoryModule } from './resource/category/category.module';
import { EmailModule } from './resource/auth/email.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AppService } from './app.service';
@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    ScheduleModule.forRoot(),

    MongooseModule.forRoot(appConfig().dbUrl, {
      // useNewUrlParser: true,
      // // useUnifiedTopology: true,

      dbName: appConfig().dbName,
    }),
    EmailModule,

    AuthModule,
    AdModule,
    UserModule,
    ItemsModule,
    CategoryModule,
    EstimateModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
