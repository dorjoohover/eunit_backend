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
import { AdService } from './ad.service';
import {
  CalcDataDto,
  CalculateApartmentDto,
  CalculateBuildingDto,
  CreateAdDto,
  ServiceDto,
} from './dto/create-ad.dto';
import { UpdateAdDto } from './dto/update-ad.dto';
import { Public } from 'src/auth/guards/jwt/auth-guard';
import { LocationService } from '../location/location.service';
import { LocationDao } from '../location/location.dao';
import locationData from '../../excel/togtool.json';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ServiceDao } from './service.dao';
import { ServiceService } from './service.service';
@Controller('ad')
export class AdController {
  constructor(
    private readonly adService: AdService,
    private readonly serviceService: ServiceService,
    private readonly locationDao: LocationDao,
    private readonly service: ServiceDao,
  ) {}

  @Post()
  create(@Body() createAdDto: CreateAdDto) {
    return this.adService.create(createAdDto);
  }

  @Public()
  @Post('/data')
  createDataAd() {
    return this.adService.createDataExcel();
  }
  @Public()
  @Post('/location')
  createDataLocation() {
    return this.adService.createDataExcelLocation();
  }

  @Public()
  @Post('/constant')
  createConstant() {
    return this.adService.createConstant();
  }

  @ApiBearerAuth('access-token')
  @Post('/service')
  async createService(@Body() dto: ServiceDto, @Request() { user }) {
    return this.service.create(dto, +user['id']);
  }
  @ApiBearerAuth('access-token')
  @Get('/service/:type/:page/:limit')
  @ApiParam({ name: 'type' })
  @ApiParam({ name: 'page' })
  @ApiParam({ name: 'limit' })
  async getServiceByType(
    @Param('type') type: string,
    @Param('page') page: string,
    @Param('limit') limit: string,
    @Request() { user },
  ) {
    return this.service.findByTypeAndUser(+type, user['id'], +page, +limit);
  }

  @ApiBearerAuth('access-token')
  @Post('/calculate/service')
  async calculateService(@Body() dto: ServiceDto, @Request() { user }) {
    return this.serviceService.calculate(dto);
  }

  @Public()
  @Post('/calc')
  async calcData(@Body() dto: CalcDataDto) {
    const location = await this.locationDao.findById(dto.location);
    const res = await this.adService.calcData(dto);
    return {
      ...res,
      location,
    };
  }

  @Public()
  @Get('/district')
  async calcDistrict() {
    return this.adService.calcDistrict();
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.adService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateAdDto: UpdateAdDto) {
  //   return this.adService.update(+id, updateAdDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.adService.remove(+id);
  // }
}
