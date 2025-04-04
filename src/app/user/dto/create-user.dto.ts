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

export class WalletUserDto {
  @ApiProperty()
  email: string;
  @ApiProperty()
  wallet: number;
  @ApiProperty()
  message: string;
}

export class UserFindDto {
  limit: number;
  page: number;
  email?: string;
  lastname?: string;
  firstname?: string;
  phone?: string;
  date?: string;
  method?: number;
}
