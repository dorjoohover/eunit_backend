import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty()
  email: string;
  @ApiProperty()
  password?: string;
  @ApiProperty()
  profile?: string;
  @ApiProperty()
  name?: string;
}

export class RegisterUserDto {
  @ApiProperty()
  email: string;
  @ApiProperty()
  phone: string;
  @ApiProperty()
  firstname: string;
  @ApiProperty()
  lastname: string;
}

export class Token {
  @ApiProperty()
  token: string;
}
