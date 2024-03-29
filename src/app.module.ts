import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import appConfig from './config/app.config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './resource/auth/auth.module';
import { AdModule } from './resource/ad/ad.module';
import { UserModule } from './resource/user/user.module';
import { ItemsModule } from './resource/items/items.module';
import { CategoryModule } from './resource/category/category.module';
import { EstimateModule } from './resource/estimate/estimate.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { MulterModule } from '@nestjs/platform-express';
@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),

    MongooseModule.forRoot(appConfig().dbUrl, {
      // useNewUrlParser: true,
      // // useUnifiedTopology: true,

      dbName: appConfig().dbName,
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        transport: {
          host: 'smtp.ethereal.email',
          port: 587,
          service: 'gmail',
          auth: {
            user: 'dorjoohover@gmail.com',
            pass: 'qwrn ysyk prkg iuls',
          },
        },
        defaults: {
          from: 'dorjoohover@gmail.com',
        },
      }),
    }),

    AuthModule,
    AdModule,
    UserModule,
    ItemsModule,
    CategoryModule,
    EstimateModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
