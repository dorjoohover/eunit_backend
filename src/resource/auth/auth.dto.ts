import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class RegisterUser {
  @IsNotEmpty()
  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  // @IsString()
  phone: string;
}

export class LoginUser {
  @ApiProperty()
  name: string;

  @ApiProperty()
  profileImg: string;

  @ApiProperty()
  // @IsEmail()
  email: string;
}
