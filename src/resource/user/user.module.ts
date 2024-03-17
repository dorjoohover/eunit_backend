import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Ad, AdSchema, Feedback, FeedbackSchema, User, UserSchema } from 'src/schema';

import { UserController } from './user.controller';
import { UserService } from './user.service';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Ad.name, schema: AdSchema },
      { name: Feedback.name, schema: FeedbackSchema },
    ]),
  ],
  controllers: [UserController, ],
  providers: [UserService,  ],
  exports: [UserService, ],
})
export class UserModule {}
