import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';

import { Category, CategoryDocument, Item, ItemDocument } from 'src/schema';
import { CategoryDto } from './category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private model: Model<CategoryDocument>,
    @InjectModel(Item.name) private itemModel: Model<ItemDocument>,
  ) {}

  async createCategory(dto: CategoryDto) {
    let category = await this.model.findOne({ name: dto.name });
    if (category) throw new ForbiddenException('found that category');

    try {
      category = await this.model.create({
        name: dto.name,
        parent: dto.parent,
        href: dto.href,
        english: dto.english,
        steps: dto.steps,
        suggestionItem: dto.suggestionItem,
        estimate: dto.estimate,
      });
      return category;
    } catch (error) {
      throw new HttpException('server error', 500);
    }
  }

  async getAllCategories(estimate: boolean) {
    try {
      let categories = await this.model
        .find({ estimate: estimate ? estimate : { $ne: true }, parent: null })
        .where('isParent')
        // .equals(true)
        .populate(
          'subCategory',
          'id name subCategory filters  href english viewFilters',
          this.model,
        )
        .exec();
      if (!categories) throw new ForbiddenException('not found');

      return categories;
    } catch (error) {
      console.log(error);
      throw new HttpException('server error', 500);
    }
  }

  async getCategoryById(id: string) {
    try {
      let category;
      if (mongoose.Types.ObjectId.isValid(id)) {
        category = await this.model.findById(id).exec();
      } else {
        category = await this.model.findOne({ href: id }).exec();
      }
      return category;
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  async getSubCategoryFiltersById(id: string) {
    try {
      let subCategory;
      if (mongoose.Types.ObjectId.isValid(id)) {
        subCategory = await this.model
          .findById(id)
          .populate(
            'steps.values',
            'name value types type index position parentId other isSearch isUse',
            this.itemModel,
          )
          .populate('subCategory', 'name english href', this.model)
          .exec();
      } else {
        subCategory = await this.model
          .findOne({ href: id })
          .populate(
            'steps.values',
            'name value types type index position parentId other isSearch isUse',
            this.itemModel,
          )
          .populate('subCategory', 'name english href', this.model)
          .exec();
      }
      if (!subCategory)
        throw new HttpException('not found', HttpStatus.NOT_FOUND);

      return subCategory;
    } catch (error) {
      throw new HttpException(error, 500);
    }
  }

  async updateCategoryById(id: string, dto: CategoryDto) {
    try {
      await this.model.findByIdAndUpdate(id, {
        name: dto.name,
        parent: dto.parent,
        href: dto.href,
        english: dto.english,
        steps: dto.steps,
        suggestionItem: dto.suggestionItem,
      });
      return true;
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  // async deleteAllCategory() {
  //   let category = this.model.deleteMany().then((d) => console.log(d));
  //   return category;
  // }
}
