import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { CreateAdSteps } from 'src/utils/enum';


export type CategoryDocument = Document & Category;
export class CategorySteps {
  @Prop({ type: String, enum: CreateAdSteps })
  step: CreateAdSteps;

  @Prop({ type: mongoose.Schema.Types.Array, ref: 'items' })
  values: string[];
}

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true })
  name: string;

  @Prop()
  english: string;

  @Prop({ default: null, type: mongoose.Types.ObjectId, ref: 'categories' })
  parent?: string;

  @Prop({type: Array<CategorySteps>})
  steps: CategorySteps[];

  @Prop()
  suggestionItem: string[];

  @Prop()
  subCategory: string[];

  @Prop()
  href: string;

  @Prop()
  estimate: boolean;
}
export const CategorySchema = SchemaFactory.createForClass(Category);
