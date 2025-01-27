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
} from './dto/create-ad.dto';
import { UpdateAdDto } from './dto/update-ad.dto';
import { Public } from 'src/auth/guards/jwt/jwt-auth-guard';
import { LocationService } from '../location/location.service';
import { LocationDao } from '../location/location.dao';
import locationData from '../../excel/togtool.json';
import { ApiBearerAuth } from '@nestjs/swagger';
@Controller('ad')
export class AdController {
  constructor(
    private readonly adService: AdService,
    private readonly locationDao: LocationDao,
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

  @Public()
  @ApiBearerAuth('access-token')
  @Post('/calculate/building')
  async calc(@Body() dto: CalculateBuildingDto, @Request() { user }) {
    return this.adService.calculateBuilding(dto);
    // return this.adService.calculateBuilding(dto, +user['id']);
  }

  @Public()
  @ApiBearerAuth('access-token')
  @Post('/calculate/apartment')
  async calcDataByLocation(
    @Body() dto: CalculateApartmentDto,
    @Request() { user },
  ) {
    // const id =
    // const res = await this.adService.calculateAparment(dto, +user['id']);
    const res = await this.adService.calculateAparment(dto);
    return {
      ...res,
    };
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

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAdDto: UpdateAdDto) {
    return this.adService.update(+id, updateAdDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adService.remove(+id);
  }
}
