import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import {
  AdSellType,
  AdStatus,
  AdTypes,
  AdView,
  ItemPosition,
  ItemTypes,
} from '../utils/enum';

export type AdDocument = Document & Ad;

export class AdItems {
  @Prop({ required: true })
  id: string;
  @Prop({ required: true })
  name: string;
  @Prop({ required: true })
  value: string;
  @Prop({ type: String, enum: ItemPosition })
  position: ItemPosition;
  @Prop({ type: String, enum: ItemTypes })
  type: ItemTypes;
  @Prop({ required: true })
  index: number;
  @Prop({ required: true, default: false })
  isSearch: boolean;
  @Prop({ required: true })
  isUse: boolean;
}
export class AdLocation {
  @Prop()
  lat: string;
  @Prop()
  lng: string;
}
@Schema({ timestamps: true, toJSON: { getters: true, minimize: false } })
export class Ad {
  @Prop({ default: 1 })
  num: number;
  @Prop({ required: true, max_length: 100 })
  title: string;

  @Prop()
  images: [];

  @Prop({ max_length: 1000 })
  description: string;

  @Prop()
  location: AdLocation;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'categories' })
  subCategory: string;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'categories' })
  category: string;

  @Prop({ type: String, enum: AdSellType })
  sellType: AdSellType;

  @Prop([AdItems])
  items: AdItems[];

  @Prop({ type: String, enum: AdTypes, default: AdTypes.default })
  adType: AdTypes;

  @Prop({ type: String, enum: AdStatus, default: AdStatus.pending })
  adStatus: AdStatus;

  @Prop()
  image: string;

  @Prop()
  file?: string;

  @Prop({ type: String, enum: AdView })
  view: AdView;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'users' })
  user: string;

  @Prop({ type: mongoose.Schema.Types.Array, ref: 'users' })
  views?: string[];

  @Prop({ max_length: 1000 })
  returnMessage?: string;
}

export const AdSchema = SchemaFactory.createForClass(Ad);
AdSchema.index({ title: 'text' });
