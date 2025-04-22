import { ApiProperty } from '@nestjs/swagger';

export class CreateLocationDto {
  @ApiProperty()
  lat?: number;
  @ApiProperty()
  lng?: number;
  @ApiProperty()
  district: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  town?: string;
  @ApiProperty()
  englishNameOfTown?: string;
  @ApiProperty()
  khoroo?: number;
  @ApiProperty()
  city: string;
  @ApiProperty()
  street?: string;
  @ApiProperty()
  zipcode?: number;
  @ApiProperty()
  no?: string;
  @ApiProperty()
  operation?: string;
  // @ApiProperty()
  // committee?: number;
  @ApiProperty()
  operationOrNot?: boolean;
}
