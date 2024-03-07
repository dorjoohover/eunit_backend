import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document } from "mongoose";
import { PointSendType, PointTitle, Socials, UserStatus, UserType } from "src/utils/enum";

export type UserDocument = Document & User
export class UserLocation {
  
    @Prop()
    lat: string;
    @Prop()
    lng: string;
  }

export class AgentAddition {
    @Prop()
    organizationName?: string
    @Prop()
    organizationContract?: string
    @Prop()
    identityCardFront?: string
    @Prop()
    identityCardBack?: string
    @Prop()
    location?: UserLocation
    @Prop()
    firstName?: string
    @Prop()
    lastName?: string
    @Prop()
    registerNumber?: string

}
export class OrganizationAddition {
    @Prop()
    organizationName: string
    @Prop()
    organizationCertificationCopy: string
    @Prop()
    location: UserLocation
    @Prop()
    organizationRegisterNumber: string

}

export class Social {
    @Prop()
    url: string
    @Prop({type: String, enum: Socials})
    name: Socials

}
export class PointHistory {
    @Prop()
    point: number

    @Prop({type: mongoose.Types.ObjectId, ref: 'users'})
    sender: string
    
    @Prop({type: mongoose.Types.ObjectId, ref: 'users'})
    receiver: string

    @Prop({ type: String, enum: PointSendType,  })
    type: PointSendType;

    @Prop({ type: String, enum: PointTitle,  })
    title?: PointTitle ;

    @Prop()
    message: string

}
@Schema({timestamps: true,  toJSON: {getters: true, minimize: false}})
export class User  {
    @Prop()
    username: string

    @Prop()
    profileImg?: string

    @Prop()
    ads: string[]

    @Prop()
    phone: string

    @Prop({ type: String, enum: UserType, default: UserType.default })
    userType: UserType;
    
    @Prop({type: Array<Social>})
    socials: Social[]

    @Prop({required: true})
    email: string

    @Prop()
    password: string

    @Prop({required: true, default: 0})
    point: number

    @Prop()
    birthday?: string
    @Prop()
    bookmarks: number[]

    @Prop({type: AgentAddition  })
    agentAddition: AgentAddition 
    @Prop({type:  OrganizationAddition })
    organizationAddition:  OrganizationAddition
    
    @Prop({type: Array<PointHistory>})
    pointHistory : PointHistory[]
    @Prop()
    code: string

    @Prop({ type: String, enum: UserStatus, default: UserStatus.pending })
    status: UserStatus;
    @Prop()
    message: string
}

export const UserSchema = SchemaFactory.createForClass(User)