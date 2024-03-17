import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  Category,
  CategorySchema,
  Estimate,
  EstimateSchema,
  Item,
  ItemSchema,
  User,
  UserSchema,
} from 'src/schema';
import { CategoryService } from '../category/category.service';
import { EstimateController } from './estimate.controller';
import { EstimateService } from './estimate.service';
import { UserService } from '../user/user.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Estimate.name, schema: EstimateSchema },
      { name: Category.name, schema: CategorySchema },
      { name: User.name, schema: UserSchema },
      { name: Item.name, schema: ItemSchema },
    ]),
  ],
  controllers: [EstimateController],
  providers: [CategoryService, EstimateService, UserService],
})
export class EstimateModule {}
