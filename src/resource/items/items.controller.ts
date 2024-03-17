import {
  Body,
  Controller,
  Get,
  HttpException,
  Patch,
  Post,
  Put,
  Param,
} from '@nestjs/common';

import { ApiParam, ApiTags } from '@nestjs/swagger';

import { ItemDto } from './items.dto';
import { ItemsService } from './items.service';

@Controller('items')
@ApiTags('Items')
export class ItemsController {
  constructor(private service: ItemsService) {}

  @Post()
  createItem(@Body() dto: ItemDto) {
    try {
      return this.service.createItem(dto);
    } catch (error) {
      throw new HttpException(error, 500);
    }
  }

  @Get()
  async getItems() {
    return this.service.findAll();
  }

  @Get('/:type')
  @ApiParam({ name: 'type' })
  async getByType(@Param('type') type: string) {
    return this.service.findByType(type);
  }

  @Put('/:id')
  @ApiParam({ name: 'id' })
  async updateItems(@Param('id') id: string) {
    return this.service.updateItemOther(id);
  }

  @Patch(':id')
  @ApiParam({ name: 'id' })
  async updateItemById(@Param('id') id: string, @Body() dto: ItemDto) {
    return this.service.updateItemById(id, dto);
  }
}
