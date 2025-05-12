import { Injectable } from '@nestjs/common';
import { ServiceDao } from './service.dao';
import { BaseService } from 'src/base/base.service';
import {
  CalculateApartmentDto,
  CalculateBuildingDto,
  ServiceDto,
} from './dto/create-ad.dto';
import { NutagDevsgerBuschlel, ServiceDataType } from 'src/base/constants';
import { LocationDao } from '../location/location.dao';
import togtool from '../../excel/togtool.json';
import { NotApartmentIndex } from 'src/base/cost.index';
@Injectable()
export class ServiceService extends BaseService {
  constructor(
    private readonly dao: ServiceDao,
    private readonly locationDao: LocationDao,
  ) {
    super();
  }

  public async calculate(dto: ServiceDto) {
    let body: any = {};
    let res: any = { code: dto.code };
    if (dto.type == ServiceDataType.APARTMENT) {
      body = {
        area: dto.aggregations['area'],
        code: dto.aggregations['code'],
        district: dto.aggregations['district'],
        index: dto.aggregations['index'],
        khoroo: dto.aggregations['khoroo'],
      } as CalculateApartmentDto;
      res = await this.calculateAparment(body);
    }
    if (dto.type == ServiceDataType.BUILDING) {
      body = {
        area: dto.aggregations['area'],
        buildingFloor: dto.aggregations['buildingFloor'],
        ceil: dto.aggregations['ceil'],
        class: dto.aggregations['class'],
        electric: dto.aggregations['electric'],
        index: dto.aggregations['index'],
        location: dto.aggregations['location'],
        quality: dto.aggregations['quality'],
        range: dto.aggregations['range'],
        san: dto.aggregations['san'],
        type: dto.aggregations['type'],
        usage: dto.aggregations['usage'],
        engineering: dto.aggregations['engineering'],
        haniinZuzaan: dto.aggregations['haniinZuzaan'],
        natural: dto.aggregations['natural'],
      } as CalculateBuildingDto;
      res = { ...(await this.calculateBuilding(body)) };
    }
    await this.dao.update(res);
  }
  public async findFromCJ(
    dataType: number,
    usage: string,
    type: string,
    c: string,
  ) {
    const cate = togtool[`${dataType}`][usage];
    if (cate == undefined) return false;

    const response = await Promise.all(
      cate
        .map((cat) => {
          if (cat.type == type) {
            const res = cat.cost[c];
            if (res == undefined) {
              return false;
            }
            return res;
          }
        })
        .filter((f) => f != undefined),
    );
    return response?.[0] == undefined ? false : response[0];
  }
  public async calculateBuilding(dto: CalculateBuildingDto) {
    let unitPowerPrice = await this.findFromCJ(
      ServiceDataType.BUILDING,
      dto.usage,
      dto.type,
      dto.class,
    );
    let buildingFloor = 1,
      location = NutagDevsgerBuschlel[dto.location ?? 'Улаанбаатар хот'],
      haniinZuzaan = dto.haniinZuzaan ?? 1,
      natural = dto.natural ?? 1,
      engineering = dto.engineering ?? 1;

    const date = dto.index ? dto.index.getFullYear() : 2016;
    const priceIndex = NotApartmentIndex(date);
    if (!unitPowerPrice) {
      // console.log(res);
      unitPowerPrice = null;
    }
    unitPowerPrice *= 1000;
    const transportDistanceData = togtool['Тээврийн зайн итгэлцүүр'];
    const transportDistance = await Promise.all(
      transportDistanceData
        .map((transport) => {
          if (transport['range'] == dto.range) return transport['coefficient'];
        })
        .filter((d) => d != undefined),
    );

    const buildingFloorIndex = togtool['Барилгын өндрын итгэлцүүр']
      .map((a) => {
        if (a.type == dto.usage) return a.coefficient;
      })
      .filter((d) => d != undefined)[0];
    buildingFloor =
      1 +
      (dto.buildingFloor - buildingFloorIndex < 0
        ? 0
        : dto.buildingFloor - buildingFloorIndex) *
        0.05;

    const usage = togtool['4'][dto.usage];
    let catalog = await Promise.all(
      usage
        .map((u) => {
          if (u.type == dto.type) return u;
        })
        .filter((a) => a != undefined),
    );
    catalog = catalog[0];
    const burenOrtog =
      unitPowerPrice *
      haniinZuzaan *
      transportDistance[0] *
      buildingFloor *
      location *
      natural *
      engineering *
      priceIndex *
      dto.area;

    let undsenHiits =
        catalog.structure *
        togtool['Элэгдлийн хувь']
          .map((el) => {
            if (el.score == dto.quality) return el.round;
          })
          .filter((a) => a != undefined)[0],
      ceil =
        catalog.ceil *
        togtool['Элэгдлийн хувь']
          .map((el) => {
            if (el.score == dto.ceil) return el.round;
          })
          .filter((a) => a != undefined)[0],
      electric =
        catalog.electric *
        togtool['Элэгдлийн хувь']
          .map((el) => {
            if (el.score == dto.electric) return el.round;
          })
          .filter((a) => a != undefined)[0],
      san =
        catalog.san *
        togtool['Элэгдлийн хувь']
          .map((el) => {
            if (el.score == dto.san) return el.round;
          })
          .filter((a) => a != undefined)[0];

    const elegdelPercent = undsenHiits + ceil + electric + san;

    const elegdel = (burenOrtog * Math.round(elegdelPercent)) / 100;

    const res = burenOrtog - elegdel;

    return {
      unitPowerPrice,
      priceIndex,
      elegdelPercent,
      elegdel,
      burenOrtog,
      price: res,
    };
  }
  public async calculateAparment(dto: CalculateApartmentDto) {
    const location = (
      await this.locationDao.findLocationByDistrict(
        dto.district,
        undefined,
        dto.khoroo,
      )
    ).map((a) => a.id);
    // let ads = await this.dao.findReview(location, dto.area);
    // if (ads.length <= 3 || !ads) ads = await this.dao.findReview(location, 0);
    // let data = ads.map((d) => +d.unitPrice);
    // const half = Math.floor(data.length / 2);
    // const sorted = data.sort((a, b) => a - b);
    // const res = {
    //   min: Math.min(...data),
    //   max: Math.max(...data),
    //   avg: Math.round(
    //     half % 2 ? sorted[half] : (sorted[half - 1] + sorted[half]) / 2,
    //   ),
    // };
    // return res;
    return {};
  }
}
