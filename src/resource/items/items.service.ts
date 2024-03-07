import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Item, ItemDocument } from 'src/schema';
import { ItemDto } from './items.dto';

@Injectable()
export class ItemsService {
  constructor(@InjectModel(Item.name) private model: Model<ItemDocument>) {}
  async createItem(dto: ItemDto) {
    try {
      let item = await this.model.findOne({
        $or: [{ name: dto.name }, { type: dto.type }],
      });
      if (item) throw new HttpException('found', HttpStatus.FOUND);
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
      return item;
    } catch (error) {
      throw new HttpException(error, 500);
    }
  }

  async findAll() {
    try {
      let items = await this.model.find();
      return items;
    } catch (error) {
      throw new HttpException(error, 500);
    }
  }
  async findByType(type: string) {
    try {
      let item = await this.model.findOne({ type: type });
      if (!item) throw new HttpException('not found', HttpStatus.NOT_FOUND);
      return item;
    } catch (error) {
      throw new HttpException(error, 500);
    }
  }

  async updateItemOther(id: string) {
    try {
      let items = await this.model.updateOne(
        { _id: id },
        { $set: { other: true } },
      );
      return items;
    } catch (error) {
      throw new HttpException(error, 500);
    }
  }

  async updateItemById(id: string , dto: ItemDto) {
    try {
      let item = await this.model.findByIdAndUpdate(id, dto);
      return item;
    } catch (error) {
      throw new HttpException(error, 500);
    }
  }
}
