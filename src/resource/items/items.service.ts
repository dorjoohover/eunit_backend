import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ItemDto, ItemRequired } from './dto/items.dto';
import { Item, ItemDocument } from '../../schema';
import {
  ItemsAlreadyExists,
  ItemsErrorExists,
  ItemsNotFound,
} from './items.exists.exception';
import { ActionMessage } from '../../utils/enum';
export interface CreateElementType  {
  success: boolean;
  status: number;
  message: ActionMessage;
  id: string
}
@Injectable()
export class ItemsService {
  constructor(@InjectModel(Item.name) private model: Model<ItemDocument>) {}
  async createItem(dto: ItemDto): Promise<CreateElementType> {
    // try {
    
    let item = await this.model.findOne({
      $or: [{ name: dto.name }, { type: dto.type }],
    });
    // return item
    if (item) throw new ItemsAlreadyExists();
    if (!ItemRequired(dto)) throw new ItemsErrorExists();
    item = await this.model.create({
      name: dto.name,
      index: dto.index,
      types: dto.types,
      position: dto.position,
      parentId: dto.parentId,
      value: dto.value,
      other: dto.other,
      type: dto.type,
      isSearch: dto.isSearch,
      isUse: dto.isUse,
    });
    // return true
    // return item;
    return {
      success: true,
      status: 201,
      message: ActionMessage.success,
      id: item._id,
    };
    // } catch (error) {
    //   console.log(error)
    //   throw new ItemsErrorExists()
    // }
  }

  async findAll() {
    let items = await this.model.find();

    return items;
  }
  async findByType(type: string): Promise<Item | null> {
    let item = await this.model.findOne({ type: type });
    if (!item) throw new ItemsNotFound();
    return item;
  }

  async updateItemOther(id: string) {
    let item = await this.model.findById(id);
    if (!item) throw new ItemsNotFound();
    await this.model.updateOne({ _id: id }, { $set: { other: true } });
    return {
      success: true,
      status: 201,
      message: 'success',
    };
  }

  async updateItemById(id: string, dto: ItemDto) {
    let item = await this.model.findById(id);
    if (!item) throw new ItemsNotFound();
    if (!ItemRequired(dto)) throw new ItemsErrorExists();
    item = await this.model.findByIdAndUpdate(id, dto);
    return item;
  }
}
