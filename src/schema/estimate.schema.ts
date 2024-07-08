import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { AdSellType, EstimateStatus, ItemTypes } from '../utils/enum';


export type EstimateDocument = Estimate & Document;

export class EstimateItems {
  @Prop({ required: true })
  id: string;
  @Prop({ required: true })
  name: string;
  @Prop({ required: true })
  value: string;

  @Prop({ type: String, enum: ItemTypes })
  type: ItemTypes;
  @Prop()
  index: number;
}

@Schema({timestamps: true})
export class Estimate {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'categories' })
  subCategory: string;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'categories' })
  category: string;

  @Prop({ type: String, enum: AdSellType })
  sellType: AdSellType;

  @Prop({type: Array<EstimateItems>})
  items: EstimateItems[];

  @Prop({ type: String, enum: EstimateStatus, default: EstimateStatus.pending })
  status: EstimateStatus;

  @Prop()
  file?: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'users' })
  user: string;

  @Prop()
  price?: number

  @Prop({ max_length: 1000 })
  returnMessage?: string;
}

export const EstimateSchema = SchemaFactory.createForClass(Estimate);
