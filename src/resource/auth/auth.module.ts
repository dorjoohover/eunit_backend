import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Ad, AdSchema, User, UserSchema } from '../../schema';
import { UserService } from '../user/user.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Ad.name, schema: AdSchema },
    ]),
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
  ],
  controllers: [AuthController],
  providers: [AuthService, UserService],
})
export class AuthModule {}
