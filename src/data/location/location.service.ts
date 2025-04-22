import { Injectable } from '@nestjs/common';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { BaseService } from 'src/base/base.service';
import { LocationDao } from './location.dao';
import { AdDao } from '../ad/ad.dao';

@Injectable()
export class LocationService extends BaseService {
  constructor(
    private dao: LocationDao,
    private adDao: AdDao,
  ) {
    super();
  }
  create(createLocationDto: CreateLocationDto) {
    return 'This action adds a new location';
  }

  async countDistrict() {
    const district = await this.dao.findDistricts();
    const res = await Promise.all(
      district.map(async (d) => {
        const ad = (await this.adDao.countDataLocationId(d.ids)).reduce(
          (a, b) => a.count + b.count,
        );
        return {
          district: d.district,
          count: +ad.count,
        };
      }),
    );
    return res;
  }

  async countLocation(id: string, town: boolean) {
    let locations = await this.dao.findLocationByDistrict(id, town);
    locations = await Promise.all(
      locations.map(async (location) => {
        const count = await this.adDao.countDataLocationId([location.id]);
        return {
          ...location,
          count: +count[0].count,
        };
      }),
    );
    return locations;
  }
  findAll() {
    return `This action returns all location`;
  }

  findOne(id: number) {
    return `This action returns a #${id} location`;
  }

  update(id: number, updateLocationDto: UpdateLocationDto) {
    return `This action updates a #${id} location`;
  }

  remove(id: number) {
    return `This action removes a #${id} location`;
  }
}
