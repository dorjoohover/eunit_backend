import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document } from "mongoose";
import { User } from "./user.schema";

export type FeedbackDocument = Feedback & Document



@Schema()
export class Feedback {
    @Prop({type: mongoose.Types.ObjectId, ref:'users'})
    user?: string
  
    @Prop()
    title: string

    @Prop({required: true})
    message: string
}

export const FeedbackSchema = SchemaFactory.createForClass(Feedback)