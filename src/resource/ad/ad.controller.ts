import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Logger,
  Param,
  Post,
  Put,
  Query,
  Req,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import mongoose from 'mongoose';

import {
  ActionMessage,
  AdStatus,
  AdTypes,
  PointSendType,
  UserType,
} from '../../utils/enum';

import {
  AdDataDto,
  AdDto,
  AdFilterDto,
  DataFilterDto,
  FilterDto,
} from './dto/ad.dto';
import { AdService } from './ad.service';
import { AuthGuard } from '../../guard/auth.guard';
import { Roles } from '../../guard/roles.decorator';
import { Cron } from '@nestjs/schedule';
import { Response } from 'express';
import { NotEnoughEunit } from './ad.exists.exception';
import { ExcelService } from './excel.service';

@ApiTags('Ads')
@Controller('ad')
export class AdController {
  constructor(
    private readonly service: AdService,
    private readonly excel: ExcelService,
  ) {}
  private readonly logger = new Logger(AdController.name);

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
          status: 500,
          success: false,
          id: '',
        };
      case 'special': {
        if (user.point >= 10000) {
          return this.service.createAd(dto, user['_id']);
        } else {
          throw new NotEnoughEunit();
        }
      }
      default:
        return this.service.createAd(dto, user['_id']);
    }
  }
  @Post('data')
  async uploadData(@Body() dto: AdDataDto) {
    return this.service.uploadData(dto);
  }
  @Post('data/filter/:page')
  async dataFilter(@Body() dto: DataFilterDto, @Param('page') page: number) {
    return this.service.dataFilter(dto, page);
  }

  @Get('data/items/:name/:value/:category')
  @ApiParam({ name: 'value' })
  @ApiParam({ name: 'name' })
  @ApiParam({ name: 'category' })
  async getLocation(
    @Param('value') value: string,
    @Param('name') name: string,
    @Param('category') category: number,
  ) {
    // if (name == 'location') return this.service.getLocation(value);
    return this.service.getItems(name, value, category);
  }

  @Get('my/:num/:limit/:cate/:status/:type/:length')
  @ApiOperation({ description: 'ooriin zar harah' })
  @ApiParam({ name: 'num' })
  @ApiParam({ name: 'limit' })
  @ApiParam({ name: 'status' })
  @ApiParam({ name: 'cate' })
  @ApiParam({ name: 'type' })
  @ApiParam({ name: 'length' })
  @UseGuards(AuthGuard)
  async getMyAds(
    @Param('num') num: number,
    @Param('limit') limit: number,
    @Param('cate') cate: string,
    @Param('status') status: AdStatus,
    @Param('length') length: number,
    @Param('type') type: AdTypes,
    @Request() { user },
  ) {
    const ads = await this.service.getMyAds(
      num,
      limit,
      cate,
      status,
      length,
      type,
      user['_id'],
    );
    return ads;
  }

  @Get('get/:num/:limit/:type/:length')
  // @ApiCreatedResponse({ description: 'Created Succesfully' })
  @ApiOperation({ description: 'buh zariig harna' })
  @ApiParam({ name: 'num' })
  @ApiParam({ name: 'limit' })
  @ApiParam({ name: 'type' })
  @ApiParam({ name: 'length' })
  async getAllAds(
    @Param('num') num: number,
    @Param('limit') limit: number,
    @Param('type') type: AdTypes,
    @Param('length') length: number,
  ) {
    let ads = await this.service.getAds(
      num,
      limit,
      true,
      type,
      true,
      AdStatus.all,
      length,
    );
    return ads;
  }

  @Get('test')
  testAd(@Req() req: Request, @Res() res: Response) {
    return this.service.test()
  }

  @Get('admin/:cate/:type/:num/:limit/:status/:length')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'num' })
  @ApiParam({ name: 'cate' })
  @ApiParam({ name: 'limit' })
  @ApiParam({ name: 'status' })
  @ApiParam({ name: 'type' })
  @ApiParam({ name: 'length' })
  @Roles(UserType.admin)
  async getAll(
    @Request() { user },
    @Param('type') type,
    @Param('cate') cate: string,
    @Param('num') num: number,
    @Param('limit') limit: number,
    @Param('status') status: AdStatus,
    @Param('length') length: number,
  ) {
    let ads = await this.service.getAds(
      num,
      limit,
      false,
      type,
      type != 'all',
      status,
      length,
      cate == ' ' ? undefined : cate,
    );
    return ads;
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

  @Get('search/:value/:type/:limit/:page/:length')
  @ApiQuery({ name: 'value' })
  @ApiParam({ name: 'type' })
  @ApiParam({ name: 'page' })
  @ApiParam({ name: 'limit' })
  @ApiParam({ name: 'length' })
  @ApiOperation({ description: 'search ad' })
  async searchAd(
    @Query('value') value: string,
    @Param('type') type: AdTypes,
    @Param('page') page: number,
    @Param('limit') limit: number,
    @Param('length') length: number,
  ) {
    return this.service.searchAd(value, type, limit, page, length);
  }

  @Post('many/:num/:self/:limit/:status/:type/:length')
  @ApiParam({ name: 'num' })
  @ApiParam({ name: 'self' })
  @ApiParam({ name: 'limit' })
  @ApiParam({ name: 'status' })
  @ApiParam({ name: 'type' })
  @ApiParam({ name: 'length' })
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
    @Param('length') length: number,
  ) {
    return this.service.getManyAds(dto, num, type, self, limit, status, length);
  }

  @Get('adType/:id/:type/:message')
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
        return {
          success: true,
          messsage: ActionMessage.success,
          status: 200,
          id: id,
        };
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
        return {
          success: true,
          message: ActionMessage.success,
          status: 200,
          id: id,
        };
      }
    }
    return {
      success: false,
      message: 'not enough Eunit point',
    };
  }

  @Post('count')
  getAdCount(@Body() dto: string[]) {
    return this.service.getAdsCount(dto);
  }

  @ApiOperation({ description: 'zar g category id gaar awna' })
  @Get('category/:id/:num/:limit/:type/:length')
  @ApiParam({ name: 'id' })
  @ApiParam({ name: 'num' })
  @ApiParam({ name: 'limit' })
  @ApiParam({ name: 'length' })
  @ApiParam({ name: 'type' })
  getAdByCategoryId(
    @Param('id') id: string,
    @Param('num') num: number,
    @Param('limit') limit: number,
    @Param('type') type: AdTypes,
    @Param('length') length: number,
  ) {
    return this.service.getAdByCategoryId(id, num, limit, type, length);
  }

  @Get('json/:type')
  @ApiParam({ name: 'type' })
  @Roles(UserType.admin)
  getJsonAd(@Param('type') type: AdTypes) {
    return this.service.getAdsExcel(type);
  }

  @ApiOperation({ description: 'filter ad' })
  @Post('filter/:num/:type/:limit/:length')
  @ApiParam({ name: 'num' })
  @ApiParam({ name: 'type' })
  @ApiParam({ name: 'limit' })
  @ApiParam({ name: 'length' })
  async getFilterAd(
    @Param('num') num: number,
    @Param('type') type: AdTypes,
    @Param('limit') limit: number,
    @Param('length') length: number,
    @Body() dto: FilterDto,
  ) {
    const ads = await this.service.filterAd(dto, num, limit, type, length);
    return ads;
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

  // @ApiOperation({ description: 'filter and suggest ad by value ' })
  // @Post('/category/filter/:cateId/:num')
  // @ApiParam({ name: 'cateId' })
  // @ApiParam({ name: 'num' })
  // async getFilterByValueAd(
  //   @Param('cateId') cateId: string,
  //   @Param('num') num: number,
  //   @Body() dto: FilterDto,
  // ) {
  //   let defaultAds = await this.service.filterAd(
  //     dto,
  //     num,
  //     10,
  //     AdTypes.default,
  //     cateId,
  //   );
  //   let special = await this.service.filterAd(
  //     dto,
  //     num,
  //     4,
  //     AdTypes.special,
  //     cateId,
  //   );
  //   return { defaultAds: defaultAds, specialAds: special };
  // }

  @ApiOperation({ description: 'suggest ad by enum' })
  @Post('suggestion/:id/:num/:page')
  @ApiParam({ name: 'id' })
  @ApiParam({ name: 'num' })
  @ApiParam({ name: 'page' })
  async getSuggestion(
    @Body()
    dto: {
      id: string;
      value: string;
    },
    @Param('page') page: number,
    @Param('num') num: number,
    @Param('id') id: string,
  ) {
    return await this.service.suggestAd(id, dto, num, page);
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
  @Cron('* * 8 * * *')
  @Get('/status/timed')
  @ApiOperation({
    description: 'todorhoi hugatsaa heterwel status g ni timed bolgono',
  })
  updateStatusTimed() {
    this.logger.debug('called cron');

    return this.service.updateStatusTimed();
  }

  @Put('update/num')
  updateNum() {
    return this.service.updateNum();
  }
}
