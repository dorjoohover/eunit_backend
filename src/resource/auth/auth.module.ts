import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Ad, AdSchema, User, UserSchema } from 'src/schema';
import { UserService } from '../user/user.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MailerModule, MailerService } from '@nestjs-modules/mailer';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Ad.name, schema: AdSchema },
    ]),
    
  ],
  controllers: [AuthController],
  providers: [AuthService, UserService],
})
export class AuthModule {}
