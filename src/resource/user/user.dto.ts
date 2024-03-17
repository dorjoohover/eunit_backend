import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { PointSendType, UserStatus, UserType } from "src/utils/enum";
import { AdLocation } from "../ad/ad.dto";


export class AgentAdditionDto {
    @ApiProperty()
    organizationName: string
    @ApiProperty()
    organizationContract: string
    @ApiProperty()
    identityCardFront: string
    @ApiProperty()
    identityCardBack: string
    @ApiProperty()
    location: AdLocation
    @ApiProperty()
    firstName: string
    @ApiProperty()
    lastName: string
    @ApiProperty()
    registerNumber: string

}
export class OrganizationAdditionDto {
    @ApiProperty()
    organizationName: string
    @ApiProperty()
    organizationCertificationCopy: string
    @ApiProperty()
    location: AdLocation
    @ApiProperty()
    organizationRegisterNumber: string
}

export class CreateUserDto {
    @IsEmail()
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    email: string

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    username: string

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    phone: string

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    password: string

    @ApiProperty({enum: UserType, default: UserType.default})
    userType: UserType


}
export class UpdateUserDto {


    @ApiProperty()
    username?: string

    @ApiProperty()
    phone?: string
    @ApiProperty()
    birthday?: string

    @ApiProperty()
    password?: string

    @ApiProperty({enum: UserType, default: UserType.default})
    userType?: UserType
    @ApiProperty({enum: UserStatus, default: UserStatus.active})
    status?: UserStatus

    @ApiProperty()
    socials?: any

    @ApiProperty()
    profileImg?: string
    
    @ApiProperty()
    agentAddition?: any
    @ApiProperty()
    organizationAddition?:  any
    
}

export class AddBookmarkDto {

    @IsNotEmpty()
    @ApiProperty()
    adId: string

}

export class PointHistory {
    @ApiProperty()
    point?: number

    @ApiProperty()
    sender?: string
    @ApiProperty()
    receiver?: string

    @ApiProperty({enum: PointSendType,})
    type?: PointSendType
    
   

}


export class FeedbackDto {
    
    @ApiProperty()
    title: string
    @ApiProperty()
    @IsString()
    message: string

}