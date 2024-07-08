import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ActionMessage, EstimateStatus } from '../../utils/enum';
import {
  Category,
  CategoryDocument,
  Estimate,
  EstimateDocument,
  User,
  UserDocument,
} from '../../schema';
import { EstimateDto, EstimateRequired } from './dto/estimate.dto';
import {
  EstimateNotFound,
  EstimateWrongExists,
} from './estimate.exist.exception';

@Injectable()
export class EstimateService {
  constructor(
    @InjectModel(Estimate.name) private model: Model<EstimateDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async createEstimate(dto: EstimateDto, user: any) {
    if (!EstimateRequired(dto)) throw new EstimateWrongExists();
    const res = await this.model.create({
      user: user,
      ...dto,
    });
    return {
      success: true,
      status: 201,
      message: ActionMessage.success,
      id: res._id,
    };
  }
  async getEstimate(status: EstimateStatus) {
    const res = await this.model.find({ status: status });
    if (!res || res.length == 0) throw new EstimateNotFound();
    return res;
  }

  async getEstimateUser(user: any) {
    const res = await this.model
      .find({ user: user })
      .populate('category', '_id name', this.categoryModel);
    // .populate('subCategory', 'id name', this.categoryModel);

    if (!res || res.length == 0) throw new EstimateNotFound();
    return res;
  }

  async updateStatus(status: EstimateStatus, id: string) {
    let estimate = await this.model.findById(id);
    if (!estimate) throw new EstimateNotFound();
    estimate.status = status;
    await estimate.save();
    return {
      status: 201,
      message: ActionMessage.success,
      id: id,
      success: true,
    };
  }

  async deleteEstimate(id: string) {
    let estimate = await this.model.findById(id);
    if (!estimate) throw new EstimateNotFound();
    await estimate.deleteOne();

    return {
      status: 200,
      message: ActionMessage.success,
      id: id,
      success: true,
    };
  }

  async updatePrice(id: string, price: number) {
    let estimate = await this.model.findById(id);
    if (!estimate) throw new EstimateNotFound();
    if (!price || price < 1) throw new EstimateWrongExists();
    await estimate.updateOne({
      price: price,
      status: EstimateStatus.estimated,
    });
    return {
      status: 200,
      message: ActionMessage.success,
      id: id,
      success: true,
    };
  }

  async updateEstimate(id: string, status: EstimateStatus, message: string) {
    let estimate = await this.model.findById(id);
    if (!estimate) throw new EstimateNotFound();
    if (!Object.values(EstimateStatus).includes(status))
      throw new EstimateWrongExists();
    await estimate.updateOne({
      status: status,
      returnMessage: message ?? '',
      price: 0
    });
    return {
      success: true,
      message: ActionMessage.success,
      status: 200,
      id: id,
    };
  }
}
