import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EstimateStatus } from 'src/utils/enum';
import {
  Category,
  CategoryDocument,
  Estimate,
  EstimateDocument,
  User,
  UserDocument,
} from 'src/schema';
import { EstimateDto } from './estimate.dto';

@Injectable()
export class EstimateService {
  constructor(
    @InjectModel(Estimate.name) private model: Model<EstimateDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async createEstimate(dto: EstimateDto, user: any) {
    try {
      return await this.model.create({
        user: user,
        ...dto,
      });
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }
  async getEstimate(status: EstimateStatus) {
    try {
      return await this.model.find({ status: status });
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  async getEstimateUser(user: any) {
    try {
      const res = await this.model
        .find({ user: user })
        .populate('category', '_id name', this.categoryModel);
      // .populate('subCategory', 'id name', this.categoryModel);
 
      return res;
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  async updateStatus(status: EstimateStatus, id: string) {
    try {
      return await this.model.findByIdAndUpdate(id, {
        status: status,
      });
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  async deleteEstimate(id: string) {
    try {
      await this.model.deleteOne({ _id: id });
      return true;
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  async updatePrice(id: string, price: number) {
    try {
      return await this.model.findByIdAndUpdate(id, {
        price: price,
        status: EstimateStatus.estimated,
      });
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  async updateEstimate(id: string, status: EstimateStatus, message: string) {
    try {
      return await this.model.findByIdAndUpdate(id, {
        status: status,
        returnedMessage: message,
      });
    } catch (error) {}
  }
}
