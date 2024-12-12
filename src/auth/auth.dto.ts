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
