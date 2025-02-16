import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  Res,
} from '@nestjs/common';
import { RequestService } from './request.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { Public } from 'src/auth/guards/jwt/auth-guard';
import { Response } from 'express';

@Controller('request')
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

  @ApiBearerAuth('access-token')
  @Post()
  create(@Body() createRequestDto: CreateRequestDto, @Request() { user }) {
    try {
      return this.requestService.create(
        createRequestDto,
        user['phone'],
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

  @Get('payment/:id/:code')
  @ApiParam({ name: 'id' })
  @ApiParam({ name: 'code' })
  async checkPayment(
    @Param('id') id: string,
    @Param('code') code: string,
    @Request() { user },
  ) {
    return this.requestService.checkPayment(+id, code, user['phone']);
  }
  @Public()
  @Get('service/pdf/:id')
  @ApiParam({ name: 'id' })
  async requestPdf(@Res() response: Response, @Param('id') id: string) {
    const pdfDoc = await this.requestService.getPdf(+id);

    response.setHeader('Content-Type', 'application/pdf');
    pdfDoc.info.Title = 'Report';
    pdfDoc.pipe(response);
    pdfDoc.end();
  }
  @Get()
  @Public()
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
  // @ApiBearerAuth('access-token')
  @Public()
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
