import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty()
  email: string;
  @ApiProperty()
  name?: string;
  @ApiProperty()
  lastname?: string;
  @ApiProperty()
  phone?: string;
  @ApiProperty()
  firstname?: string;
  @ApiProperty()
  profile?: string;
  @ApiProperty()
  password?: string;
  @ApiProperty()
  role?: number;
  @ApiProperty()
  wallet?: number;
  @ApiProperty()
  birthdate?: string;
}
