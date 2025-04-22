import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { LocationService } from './location.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { ApiParam } from '@nestjs/swagger';
import { Public } from 'src/auth/guards/jwt/auth-guard';
import { ConstantValue } from 'src/base/constants';

@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Post()
  create(@Body() createLocationDto: CreateLocationDto) {
    return this.locationService.create(createLocationDto);
  }

  @Get()
  findAll() {
    return this.locationService.findAll();
  }
  @Public()
  @Get('/constant/:type/:value')
  @ApiParam({ name: 'type' })
  @ApiParam({ name: 'value' })
  getConstant(@Param('type') type: string, @Param('value') value: string) {
    if (ConstantValue.DISTRICT == +type)
      return this.locationService.countDistrict();
    if (ConstantValue.TOWN == +type)
      return this.locationService.countLocation(value, true);
    if (ConstantValue.NOTTOWN == +type)
      return this.locationService.countLocation(value, false);
  }
  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.locationService.findOne(+id);
  // }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateLocationDto: UpdateLocationDto,
  ) {
    return this.locationService.update(+id, updateLocationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.locationService.remove(+id);
  }
}
