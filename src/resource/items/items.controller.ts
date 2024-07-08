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

import { ItemDto } from './dto/items.dto';
import { CreateElementType, ItemsService } from './items.service';
import { Item } from 'src/schema';

@Controller('items')
@ApiTags('Items')
export class ItemsController {
  constructor(private service: ItemsService) {}

  @Post()
  async create(@Body() dto: ItemDto):Promise<CreateElementType> {
    // return true
    
    let item = await this.service.createItem(dto);
    return item
  }

  @Post('create')
  async createIt(dto: ItemDto) {
    return await this.service.createItem(dto)
  }
  @Get()
  async getItems() {
    return await this.service.findAll();
  }

  @Get('/:type')
  @ApiParam({ name: 'type' })
  async getByType(@Param('type') type: string): Promise<Item | null> {
    return await this.service.findByType(type);
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
