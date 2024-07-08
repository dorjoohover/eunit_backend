import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { ItemPosition, ItemTypes } from '../utils/enum';

export type ItemDocument = Item & Document;

export class ItemDetail {
  @Prop()
  id: string;

  @Prop()
  value: string;

  @Prop()
  parentId?: string;

  @Prop({ type: String, enum: ItemTypes })
  parent?: ItemTypes;
}
@Schema()
export class Item extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  index: number;

  @Prop({type: Array<ItemDetail>})
  value: ItemDetail[];
  @Prop()
  type: string;
  @Prop({ type: String, enum: ItemTypes, required: true })
  types: ItemTypes;

  @Prop({ type: mongoose.Types.ObjectId, ref: 'items' })
  parent?: string;

  @Prop({ type: String, enum: ItemPosition, default: ItemPosition.default })
  position: ItemPosition;

  @Prop()
  other: boolean;

  @Prop({ default: false })
  isSearch: boolean;

  @Prop({ default: true })
  isUse: boolean;
}

export const ItemSchema = SchemaFactory.createForClass(Item);
export const ItemModel = mongoose.model('Items', ItemSchema)