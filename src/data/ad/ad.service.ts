import { Injectable } from '@nestjs/common';
import {
  CalcDataDto,
  CalculateApartmentDto,
  CalculateBuildingDto,
  CreateAdDto,
} from './dto/create-ad.dto';
import { UpdateAdDto } from './dto/update-ad.dto';
import { BaseService } from 'src/base/base.service';
import { AdDao } from './ad.dao';
import { AppExcel } from 'src/common/app.excel';
import { LocationService } from '../location/location.service';
import { LocationDao } from '../location/location.dao';
import {
  NutagDevsgerBuschlel,
  ServiceDataType,
  ServiceType,
} from 'src/base/constants';
import { CreateLocationDto } from '../location/dto/create-location.dto';
import { writeFile } from 'fs/promises';
import { join } from 'path';

import { NotApartmentIndex } from 'src/base/cost.index';
import { ServiceDao } from './service.dao';
@Injectable()
export class AdService extends BaseService {
  constructor(
    private dao: AdDao,
    private serviceDao: ServiceDao,
    private excel: AppExcel,
    private locationDao: LocationDao,
  ) {
    super();
  }
  create(createAdDto: CreateAdDto) {
    return 'This action adds a new ad';
  }

  public async createConstant() {
    const togtool = this.excel.readExcel(
      '',
      '',
      9,
      'src/excel/baiguullagad-zoriulsan-uilchilgee.xlsx',
    );
    await writeFile(
      join(process.cwd(), 'src/excel', 'suljee.json'),
      JSON.stringify(togtool),
    );

    // const ads = this.excel.readExcel(
    //   '',
    //   '',
    //   1,
    //   'src/excel/Data_unegui_12.09_last_v_1.xlsx',
    // );
    // console.log(ads[0]);
    // try {
    //   const uniqueAds = [
    //     ...new Map(
    //       ads.map((ad) => [
    //         `${ad['Дүүрэг']}-${ad['Байршил']}`, // Combining both district and name as a string key
    //         ad, // The entire ad object is kept as the value
    //       ]),
    //     ).values(),
    //   ];
    //   uniqueAds.map(async (ad) => {
    //     const body = {
    //       city: 'Улаанбаатар',
    //       district: ad['Дүүрэг'],
    //       name: ad['Байршил'],
    //     };
    //     await this.locationDao.create(body);
    //   });
    //   locations.map(async (location) => {
    //     const lat = location['Lng'];
    //     const lng = location['Lat_1'];
    //     const district = location['Дүүрэг'];
    //     const town = location['Хотхон Монгол'];
    //     const townEnglish = location['Хотхон англи'];
    //     const name = location['Ерөнхий байршил'];
    //     const zipcode = location['Zip code'];
    //     const khoroo = location['Khoroo'];
    //     const body = {
    //       city: 'Улаанбаатар',
    //       khoroo,
    //       district,
    //       lat,
    //       lng,
    //       town,
    //       englishNameOfTown: townEnglish,
    //       name,
    //       zipcode,
    //     };
    //     this.locationDao.create(body);
    //   });
    // } catch (error) {}
  }
  public async createDataExcelLocation() {
    const locations = this.excel.readExcel(
      '',
      '',
      2,
      'src/excel/Data_unegui_12.09_last_v_1.xlsx',
    );

    const ads = this.excel.readExcel(
      '',
      '',
      1,
      'src/excel/Data_unegui_12.09_last_v_1.xlsx',
    );
    try {
      const uniqueAds = [
        ...new Map(
          ads.map((ad) => [
            `${ad['Дүүрэг']}-${ad['Байршил']}`, // Combining both district and name as a string key
            ad, // The entire ad object is kept as the value
          ]),
        ).values(),
      ];
      uniqueAds.map(async (ad) => {
        const body = {
          city: 'Улаанбаатар',
          district: ad['Дүүрэг'],
          name: ad['Байршил'],
        };
        await this.locationDao.create(body);
      });
      locations.map(async (location) => {
        const lat = location['Lng'];
        const lng = location['Lat_1'];
        const district = location['Дүүрэг'];
        const town = location['Хотхон Монгол'];
        const townEnglish = location['Хотхон англи'];
        const name = location['Ерөнхий байршил'];
        const zipcode = location['Zip code'];
        const khoroo = location['Khoroo'];
        const body = {
          city: 'Улаанбаатар',
          khoroo,
          district,
          lat,
          lng,
          town,
          englishNameOfTown: townEnglish,
          name,
          zipcode,
        };
        this.locationDao.create(body);
      });
    } catch (error) {}
  }
  public async createDataExcel() {
    const ads = this.excel.readExcel(
      '',
      '',
      0,
      'src/excel/Data_unegui_12.09_last_v_1.xlsx',
    );
    const ads1 = this.excel.readExcel(
      '',
      '',
      1,
      'src/excel/Data_unegui_12.09_last_v_1.xlsx',
    );
    // without town
    const startDate = new Date(1900, 0, 1);
    ads.map(async (ad) => {
      const buildingProcess = ad['buildingProcess'];
      const id = ad['id'];
      const title = ad['title'];
      const price = ad['price'];
      const area = ad['area'];
      const unitPrice = ad['Per price'];
      const floor = ad['floor'];
      const door = ad['door'];
      const balcony = ad['balcony'];
      const operation = ad['operation'];
      const howFloor = ad['howFloor'];
      const garage = ad['garage'];
      const window = ad['window'];
      const windowUnit = ad['windowUnit'];
      const buildingFloor = ad['buildingFloor'];
      const leasing = ad['leasing'];
      const description = ad['description'];
      const district = ad['Дүүрэг'];
      const address = ad['Ерөнхий байршил'];
      const town = ad['Хотхон Монгол'];
      const townEnglish = ad['Хотхон англи'];
      let date = ad['Date'];

      date = new Date(
        startDate.getTime() + (parseInt(date) - 2) * 24 * 60 * 60 * 1000,
      );
      let location = await this.locationDao.findByName(
        address,
        town,
        townEnglish,
        district,
      );

      const dto: CreateAdDto = {
        area: area,
        buildingFloor: buildingFloor,
        description: description,
        location: { id: location?.id },
        operation: operation,
        price: price,
        unitPrice: unitPrice,
        uneguiId: id,
        balconyUnit: balcony,
        buildingProcess:
          buildingProcess == 0 ? null : (buildingProcess ?? null),
        floor: floor,
        door: door,
        title: title,
        garage: garage,
        howFloor: howFloor,
        window: window,
        windowUnit: windowUnit,
        date: new Date(date),
        paymentMethod: leasing,
      };
      if (dto.unitPrice != null && dto.area && dto.location && dto.uneguiId) {
        await this.dao.create(dto);
      }
      // return res;
    });
    ads1.map(async (ad) => {
      const buildingProcess = ad['buildingProcess'];
      const id = ad['id'];

      const title = ad['title'];
      const price = ad['price'];
      const area = ad['area'];
      const unitPrice = ad['Per price'];
      const floor = ad['floor'];
      const door = ad['door'];
      const balcony = ad['balcony'];
      const operation = ad['operation'];
      const howFloor = ad['howFloor'];
      const garage = ad['garage'];
      const window = ad['window'];
      const windowUnit = ad['windowUnit'];
      const buildingFloor = ad['buildingFloor'];
      const leasing = ad['leasing'];
      const description = ad['description'];
      const district = ad['Дүүрэг'];
      const address = ad['Байршил'];
      let date = ad['Date'];

      date = new Date(
        startDate.getTime() + (parseInt(date) - 2) * 24 * 60 * 60 * 1000,
      );
      let location = await this.locationDao.findByNameWithout(
        address,
        district,
      );

      const dto: CreateAdDto = {
        area: area,
        buildingFloor: buildingFloor,
        description: description,
        location: { id: location?.id },
        operation: operation,
        price: price,
        unitPrice: unitPrice,
        uneguiId: id,
        balconyUnit: balcony,
        buildingProcess:
          buildingProcess == 0 ? null : (buildingProcess ?? null),
        floor: floor,
        door: door,
        title: title,
        garage: garage,
        howFloor: howFloor,
        window: window,
        windowUnit: windowUnit,
        date: new Date(date),
        paymentMethod: leasing,
      };
      if (dto.unitPrice != null && dto.area && dto.location && dto.uneguiId) {
        await this.dao.create(dto);
      }
      // return res;
    });

    // const locations = this.excel.readExcel(
    //   '',
    //   '',
    //   2,
    //   'src/excel/Data_unegui_12.09_last_v_1.xlsx',
    // );

    // console.log(res);
    // ads.map(async (ad, i) => {
    //   // if (i > 10) return;
    //   const town = ad['Хотхон Монгол'];

    //   const price = ad['price'];
    //   const area = ad['area'];
    //   const unitPrice = ad['unitPrice'];
    //   const operation = ad['operation'];
    //   const description = ad['description'];
    //   const date = ad['date'];
    //   const title = ad['title'];
    //   const buildingFloor = ad['buildingFloor'];
    //   const uneguiId = ad['id'];
    //   const location = await this.locationDao.findOne(town);
    //   if (location?.id) {
    //     // await this.dao.create({
    //     //   price,
    //     //   unitPrice,
    //     //   area,
    //     //   operation,
    //     //   description,
    //     //   date,
    //     //   title,
    //     //   buildingFloor,
    //     //   uneguiId,
    //     //   location: {
    //     //     id: location.id,
    //     //   },
    //     // });
    //   }
    // });
    // const names = this.excel.readExcel(
    //   '',
    //   '',
    //   4,
    //   'src/excel/all_data_summary_v_2.xlsx',
    // );
    // names.map(async (location, i) => {
    //   // if (i > 10) return;
    //   const lat = location['Lat'];
    //   const lng = location['Lng'];
    //   const district = location['Дүүрэг_1'];
    //   const town = location['Хотхон Монгол'];
    //   const townEnglish = location['Хотхон англи'];
    //   const name = location['Ерөнхий байршил'];
    //   const operation = location['Ашиглалтад орсон он'];
    //   const zipcode = location['Zip code'];
    //   const khoroo = location['Хороо'];
    //   const operationOrNot = `${location['Он ашиглах эсэх']}`.toLowerCase();

    //   const correct =
    //     lat != '#VALUE!' &&
    //     lat != '' &&
    //     lat != null &&
    //     townEnglish != null &&
    //     town != null &&
    //     khoroo != '' &&
    //     khoroo != null &&
    //     district != '' &&
    //     location != '' &&
    //     location != null &&
    //     name != null;
    //   if (correct) {
    //     this.locationDao.create({
    //       city: 'Улаанбаатар',
    //       khoroo,
    //       district,
    //       lat,
    //       lng,
    //       town,
    //       englishNameOfTown: townEnglish,
    //       name,
    //       operation: operation == '' ? null : operation,
    //       zipcode,
    //       operationOrNot:
    //         operationOrNot == 'yes'
    //           ? true
    //           : operationOrNot == 'no'
    //             ? false
    //             : null,
    //     });
    //   } else {
    //     return location;
    //   }
    // });
  }

  public async calcDistrict() {
    const districts = [
      'Сүхбаатар',
      'Налайх',
      'Баянгол',
      'Сонгинохайрхан',
      'Чингэлтэй',
      'Баянзүрх',
      'Хан-Уул',
    ];
    const res = await Promise.all(
      districts.map(async (district) => {
        const location = (
          await this.locationDao.findLocationByDistricts(district)
        ).map((l) => l.id);

        const ads = await this.dao.dataLocationId(location);
        return {
          name: district,
          avg: ads.avg,
          count: ads.count,
        };
      }),
    );
    return res;
  }

  public async calcData(dto: CalcDataDto) {
    if (dto.type == ServiceType.REVIEW) {
      let ads = await this.dao.findReview([dto.location], dto.area);
      if (ads.length <= 3 || !ads)
        ads = await this.dao.findReview([dto.location], 0);
      let data = ads.map((d) => +d.unitPrice);
      const half = Math.floor(data.length / 2);
      const sorted = data.sort((a, b) => a - b);
      const res = {
        min: Math.min(...data),
        max: Math.max(...data),
        avg: Math.round(
          half % 2 ? sorted[half] : (sorted[half - 1] + sorted[half]) / 2,
        ),
      };
      return res;
    }
    if (dto.type == ServiceType.DATA) {
      const all = dto.area == 0;
      let data = await this.dao.findReview(
        [dto.location],
        dto.area,
        dto.startDate,
        dto.endDate,
        all,
      );
      const limit = data.length;
      if (!dto.paid) data = data.slice(0, 5);
      return { data: data, limit };
    }
  }
}
