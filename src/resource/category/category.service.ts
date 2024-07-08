import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';

import { Category, CategoryDocument, Item, ItemDocument } from '../../schema';
import {
  CategoryDto,
  CategoryRequiredDto,
  CategorySubRequiredDto,
} from './dto/category.dto';
import {
  CategoryAlreadyExists,
  CategoryNotFound,
  CategoryWrongExists,
} from './category.exits.exception';
import { ActionMessage } from '../../utils/enum';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private model: Model<CategoryDocument>,
    @InjectModel(Item.name) private itemModel: Model<ItemDocument>,
  ) {}

  async createCategory(dto: CategoryDto) {
    let category = await this.model.findOne({ name: dto.name });
    if (category) throw new CategoryAlreadyExists();
    if (dto.parent != null) {
      if (!CategorySubRequiredDto(dto)) throw new CategoryWrongExists();
    } else {
    if (!CategoryRequiredDto(dto)) throw new CategoryWrongExists();
    }
    category = await this.model.create({
      name: dto.name,
      parent: dto.parent,
      href: dto.href,
      english: dto.english,
      steps: dto.steps,
      suggestionItem: dto.suggestionItem,
      estimate: dto.estimate,
    });
    return {
      success: true,
      id: category._id,
      message: ActionMessage.success,
      status: 201,
    };
  }

  async getAllCategories(estimate: string) {
    
      let categories = await this.model
        .find({
          estimate: estimate === 'true' ? true : null,
          parent: null,
        })
        .where('isParent')
        // .equals(true)
        .populate(
          'subCategory',
          'id name subCategory filters  href english viewFilters',
          this.model,
        )
        .exec();

      if (!categories) throw new CategoryNotFound()

      return categories;
    
  }

  async getCategoryById(id: string) {
    
      let category;
      const isValid = mongoose.Types.ObjectId.isValid(id)
      if (isValid) {
        category = await this.model.findById(id).exec();
      } else {
        category = await this.model.findOne({ href: id }).exec();
      }
      if(!category) throw new CategoryNotFound()
      return category;
    
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
