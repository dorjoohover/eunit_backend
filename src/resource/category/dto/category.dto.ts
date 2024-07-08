import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, ValidateIf } from 'class-validator';
import { CreateAdSteps } from '../../../utils/enum';

export class CategoryStepsDto {
  @ApiProperty({ enum: CreateAdSteps })
  step: CreateAdSteps;

  @ApiProperty({ isArray: true })
  values: string[];
}

export const CategoryRequiredDto = (dto: CategoryDto) => {
  return dto.name && dto.english && dto.href && dto.parent == null 
}

export const CategorySubRequiredDto = (dto: CategoryDto) => {
  return dto.name && dto.english && dto.href && dto.parent && dto.steps && dto.steps.length > 0 && dto.suggestionItem && dto.suggestionItem.length > 0
}

export class CategoryDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  english: string;

  @ApiProperty()
  @ValidateIf((object, value) => value !== null)
  parent?: string | null;

  @ApiProperty({ type: CategoryStepsDto, isArray: true })
  steps?: CategoryStepsDto[];

  @ApiProperty({ isArray: true })
  @IsArray()
  suggestionItem?: string[];

  @ApiProperty()
  @IsString()
  href: string;


  subCategory?: string[]
  @ApiProperty()
  estimate?: boolean;
}
