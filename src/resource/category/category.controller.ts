import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Put } from '@nestjs/common/decorators';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { CategoryDto } from './category.dto';
import { CategoryService } from './category.service';
@ApiTags('Category')
@Controller('category')
export class CategoryController {
  constructor(private readonly service: CategoryService) {}

  @Post()
  @ApiOperation({ description: 'admin aas category create leh' })
  createCategory(@Body() dto: CategoryDto) {
    return this.service.createCategory(dto);
  }

  @Get()
  @ApiOperation({ description: 'buh category g awah' })
  getAllCategories() {
    return this.service.getAllCategories(false);
  }

  @Get('estimate')
  getAllEstimates() {
    return this.service.getAllCategories(true);
  }
  @ApiParam({ name: 'id' })
  @Get(':id')
  @ApiOperation({ description: 'category g id gaar ni awah ' })
  getCategoryById(@Param() params) {
    return this.service.getCategoryById(params.id);
  }

  @ApiParam({ name: 'id' })
  @Get('filters/:id')
  @ApiOperation({
    description:
      'zariin filter g awah isFilter field g true = filter false = create ad  ',
  })
  getFilterById(@Param('id') id: string) {
    return this.service.getSubCategoryFiltersById(id);
  }

  @ApiParam({ name: 'id' })
  @Put(':id')
  @ApiOperation({ description: 'category update hiih ' })
  updateCategoryId(@Param('id') id: string, @Body() dto: CategoryDto) {
    return this.service.updateCategoryById(id, dto);
  }
  // @Delete()
  // deleteAllCategory() {
  //     return this.service.deleteAllCategory()
  // }
}
