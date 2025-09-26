import { Controller, Get, Param } from '@nestjs/common';
import { InfoService } from './info.service';
import { ApiParam } from '@nestjs/swagger';

@Controller('info')
export class InfoController {
  constructor(private service: InfoService) {}

  @Get('/car/:num')
  @ApiParam({ name: 'num' })
  car(@Param('num') num: string) {
    console.log(num)
    return this.service.car(num);
  }
}
