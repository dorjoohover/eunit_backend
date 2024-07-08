import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';


import { Ad, AdSchema, Category, CategorySchema, Item, ItemSchema, User, UserSchema } from '../../schema';
import { CategoryService } from '../category/category.service';
import { AdController } from './ad.controller';
import { AdService } from './ad.service';
import { UserService } from '../user/user.service';




@Module({
  imports: [MongooseModule.forFeature([{name: Ad.name, schema: AdSchema}, {name: Category.name, schema: CategorySchema}, {name: User.name, schema: UserSchema}, {name: Item.name, schema: ItemSchema}  ]), 
],
  controllers: [AdController, ],
  providers: [AdService,   CategoryService, UserService ],

})
export class AdModule {}
