import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  Post,
  Put,
  Query,
  Request,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import mongoose from 'mongoose';

import { AdSellType, AdStatus, AdTypes, PointSendType, UserType } from 'src/utils/enum';

import { AdDto, FilterDto } from './ad.dto';
import { AdService } from './ad.service';
import { AuthGuard } from 'src/guard/auth.guard';
import { Roles } from 'src/guard/roles.decorator';
import { Cron } from '@nestjs/schedule';

@ApiTags('Ads')
@Controller('ad')
export class AdController {
  constructor(private readonly service: AdService) {}

  @UseGuards(AuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ description: 'ad create' })
  @Post()
  async ad(@Request() { user }, @Body() dto: AdDto) {
    switch (dto.adType) {
      case 'sharing': {
        dto.adStatus = AdStatus.checking;
        return this.service.createAd(dto, user['_id']);
      }
      case 'poster':
        return {
          message: 'soon',
          status: false,
        };
      case 'special': {
        if (user.point >= 10000) {
          return this.service.createAd(dto, user['_id']);
        } else {
          return {
            message: 'not enough Eunit',
          };
        }
      }
      default:
        return this.service.createAd(dto, user['_id']);
    }
  }

  @Get('get/:num')
  // @ApiCreatedResponse({ description: 'Created Succesfully' })
  @ApiOperation({ description: 'buh zariig harna' })
  @ApiParam({ name: 'num' })
  async getAllAds(@Param('num') num: number) {
    let defaultAds = await this.service.getAds(
      num,
      10,
      true,
      AdTypes.default,
      true,
      AdStatus.all,
    );
    let specialAds = await this.service.getAds(
      num,
      4,
      true,
      AdTypes.special,
      true,
      AdStatus.all,
    );
    return {
      defaultAds: defaultAds,

      specialAds: specialAds,
    };
  }

  @Get('admin/:type/:num/:status')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'num' })
  @ApiParam({ name: 'status' })
  @ApiParam({ name: 'type' })
  async getAll(
    @Request() { user },
    @Param('type') type,
    @Param('num') num: number,
    @Param('status') status: AdStatus,
  ) {
    if (user.userType == 'admin' || user.userType == 'system') {
      let ads = await this.service.getAds(
        num,
        20,
        false,
        type,
        type != 'all',
        status,
      );
      if (!ads) throw new HttpException('not found ads', 402);
      return ads;
    }
    return false;
  }

  @Get('update/:id/:status/:view/:message')
  @UseGuards(AuthGuard)
  @ApiParam({ name: 'id' })
  @ApiParam({ name: 'status' })
  @ApiParam({ name: 'view' })
  @ApiQuery({ name: 'message' })
  @ApiBearerAuth('access-token')
  @ApiOperation({ description: 'change ad status' })
  updateStatusAd(
    @Request() { user },
    @Query('message') message,
    @Param('id') id,
    @Param('view') view,
    @Param('status') status,
  ) {
    return this.service.updateStatusAd(
      id,
      status,
      view,
      user['_id'],
      user.userType == 'admin' || user.userType == 'system',
      message,
    );
  }

  @Get('view/:id')
  @ApiParam({ name: 'id' })
  @UseGuards(AuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ description: 'add ad views' })
  viewAd(@Param('id') id: string, @Request() { user }) {
    return this.service.addAdView(id, user['_id']);
  }

  @Get('search/:value')
  @ApiQuery({ name: 'value' })
  @ApiOperation({ description: 'search ad' })
  async searchAd(@Query('value') value: string) {
    return this.service.searchAd(value);
  }

  @Post('many/:num/:self/:limit/:status/:type')
  @ApiParam({ name: 'num' })
  @ApiParam({ name: 'self' })
  @ApiOperation({ description: 'images by multi ids' })
  async manyAdById(
    @Body()
    dto: {
      dto: string[];
      cateId?: string;
    },
    @Param('num') num: number,
    @Param('self') self: boolean,
    @Param('limit') limit: number,
    @Param('status') status: AdStatus,
    @Param('type') type: AdTypes,
  ) {
    return this.service.getManyAds(dto, num, type, self, limit, status);
  }

  @Get('adType/:id/:type/:message/')
  @ApiParam({ name: 'id' })
  @ApiParam({ name: 'type' })
@ApiQuery({ name: 'message' })
  @UseGuards(AuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ description: 'change ad type' })
  async updateAdTypeSpecial(
    @Request() { user },
    @Param('id') id: string,
    @Param('type') type: AdTypes,
    @Query('message') message,
  ) {
    try {
      let receiver = new mongoose.mongo.ObjectId('641fc3b3bc1f3f56080e1f83');
      if (user.point >= 10000 && type == AdTypes.special) {
        let res = await this.service.updateTypeAd(id, type, true);
        if (res) {
          user.point = Number.parseFloat(user.point.toString()) - 10000;
          user.pointHistory.push({
            point: 10000,
            sender: user['_id'],
            receiver: receiver,
            type: PointSendType.sender,
            message: message ?? '',
          });
          user.save();
          return true;
        }
      }
      if (user.point >= 15000 && type == AdTypes.specialM) {
        let res = await this.service.updateTypeAd(id, type, true);
        if (res) {
          user.point = Number.parseFloat(user.point.toString()) - 15000;
          user.pointHistory.push({
            point: 15000,
            sender: user['_id'],
            receiver: receiver,
            type: PointSendType.sender,
            message: message ?? '',
          });
          user.save();
          return true;
        }
      }
      return false;
    } catch (error) {
      throw new HttpException(error, 500);
    }
  }

  @Post('count')
  getAdCount(@Body() dto: string[]) {
    return this.service.getAdsCount(dto);
  }

  @ApiParam({ name: 'id' })
  @ApiOperation({ description: 'zar g category id gaar awna' })
  @Get('category/:id/:num')
  getAdByCategoryId(@Param('id') id: string, @Param('num') num: number) {
    return this.service.getAdByCategoryId(id, num);
  }

  @Get('json/:type')
  @ApiParam({ name: 'type' })
  @Roles(UserType.admin)
  getJsonAd(@Param('type') type: AdTypes) {
    return this.service.getAdsExcel(type);
  }

  @ApiOperation({ description: 'filter ad' })
  @Post('filter/:num/:type')
  @ApiParam({ name: 'num' })
  @ApiParam({ name: 'type' })
  async getFilterAd(
    @Param('num') num: number,
    @Param('type') type: AdTypes,
    @Body() dto: FilterDto,
  ) {
    if (type == AdTypes.all) {
      let defaultAds = await this.service.filterAd(
        dto,
        num,
        10,
        AdTypes.default,
        dto.cateId,
      );
      let special = await this.service.filterAd(
        dto,
        num,
        4,
        AdTypes.special,
        '',
      );
      return { defaultAds: defaultAds, specialAds: special };
    }
    if (type == AdTypes.any) {
      return await this.service.filterAd(dto, num, 12, AdTypes.all, dto.cateId);
    } else {
      return await this.service.filterAd(
        dto,
        num,
        type == AdTypes.default ? 10 : 4,
        type,
        type == AdTypes.default ? dto.cateId : '',
      );
    }
  }
  // @ApiOperation({ description: 'filter ad' })
  // @Post('filter/:num')
  // @ApiParam({ name: 'num' })
  // async getFilterAd(@Param('num') num: number, @Body() dto: FilterDto) {
  //   let defaultAds = await this.service.filterAd(
  //     dto,
  //     num,
  //     10,
  //     AdTypes.default,
  //     dto.cateId,
  //   );
  //   let special = await this.service.filterAd(dto, num, 4, AdTypes.special, '');
  //   return { defaultAds: defaultAds, specialAds: special };
  // }

  @ApiOperation({ description: 'filter and suggest ad by value ' })
  @Post('/category/filter/:cateId/:num')
  @ApiParam({ name: 'cateId' })
  @ApiParam({ name: 'num' })
  async getFilterByValueAd(
    @Param('cateId') cateId: string,
    @Param('num') num: number,
    @Body() dto: FilterDto,
  ) {
    let defaultAds = await this.service.filterAd(
      dto,
      num,
      10,
      AdTypes.default,
      cateId,
    );
    let special = await this.service.filterAd(
      dto,
      num,
      4,
      AdTypes.special,
      cateId,
    );
    return { defaultAds: defaultAds, specialAds: special };
  }

  @ApiOperation({ description: 'suggest ad by enum' })
  @Post('suggestion/:id/:num/:page')
  @ApiParam({ name: 'id' })
  @ApiParam({ name: 'num' })
  @ApiParam({ name: 'page' })
  async getSuggestion(
    @Body() dto: {
      id: string;
      value: string;
    },
    @Param('page') page: number,
    @Param('num') num: number,
    @Param('id') id: string,
  ) {
    return await this.service.suggestAd(id,  dto, num, page);
  }

  @Get('id/:id')
  @ApiParam({ name: 'id' })
  @ApiOperation({ description: 'zariig id gaar ni awna' })
  getAdById(@Param('id') id: string) {
    return this.service.getAdById(id);
  }

  @Put('/:id')
  @ApiParam({ name: 'id' })
  @UseGuards(AuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ description: 'edit ad' })
  async editAd(
    @Request() { user },
    @Param('id') id: string,
    @Body() dto: AdDto,
  ) {
    return this.service.updateAd(id, dto);
  }

  @Delete()
  @ApiOperation({ description: 'delete all ads' })
  deleteAds() {
    return this.service.delete();
  }
  @Cron('* * * 1 * *')
  @Get('/status/timed')
  @ApiOperation({
    description: 'todorhoi hugatsaa heterwel status g ni timed bolgono',
  })
  updateStatusTimed() {
    return this.service.updateStatusTimed();
  }
}
