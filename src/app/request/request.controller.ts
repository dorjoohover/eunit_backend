import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
} from '@nestjs/common';
import { RequestService } from './request.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';

@Controller('request')
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

  @ApiBearerAuth('access-token')
  @Post()
  create(@Body() createRequestDto: CreateRequestDto, @Request() { user }) {
    try {
      return this.requestService.create(
        createRequestDto,
        user['email'],
        user['id'],
      );
    } catch (error) {
      return {
        success: false,
        message: error.message,
        status: error.status,
      };
    }
  }

  @Get()
  findAll() {
    return this.requestService.findAll();
  }

  // user all count
  @Get('all')
  findAllUser(@Request() { user }) {
    return this.requestService.findAllUser(user['id']);
  }
  @Get('user/:page/:limit')
  @ApiParam({ name: 'page' })
  @ApiParam({ name: 'limit' })
  findByUser(
    @Param('page') page: string,
    @Param('limit') limit: string,
    @Request() { user },
  ) {
    return this.requestService.findByUser(user['id'], +page, +limit);
  }
  @ApiBearerAuth('access-token')
  @Get('service/:id')
  findOne(@Param('id') id: string) {
    return this.requestService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRequestDto: UpdateRequestDto) {
    return this.requestService.update(+id, updateRequestDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.requestService.remove(+id);
  }
}
