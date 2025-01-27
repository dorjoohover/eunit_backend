import { Injectable } from '@nestjs/common';
import { DataSource, IsNull, Not, Repository } from 'typeorm';
import { LocationEntity } from './entities/location.entity';
import { CreateLocationDto } from './dto/create-location.dto';

@Injectable()
export class LocationDao {
  private db: Repository<LocationEntity>;
  constructor(private dataSource: DataSource) {
    this.db = this.dataSource.getRepository(LocationEntity);
  }

  create = async (dto: CreateLocationDto) => {
    const res = this.db.create(dto);
    await this.db.save(res);
    return res;
  };

  findDistricts = async () => {
    const res = await this.db
      .createQueryBuilder('location')
      .select('location.district', 'district')
      .addSelect('COUNT(location.district)', 'count')
      .addSelect('ARRAY_AGG(location.id)', 'ids')
      .groupBy('location.district')
      .getRawMany();
    return res;
  };

  findLocationByDistrict = async (
    id: string,
    town?: boolean,
    khoroo?: string,
  ) => {
    const whereCondition: any = {
      district: id,
    };

    if (khoroo !== undefined) {
      whereCondition.khoroo = parseInt(khoroo);
    }
    if (town !== undefined) {
      whereCondition.town = town ? Not(IsNull()) : IsNull();
    }

    try {
      const res = await this.db.find({
        where: whereCondition,
      });
      return res;
    } catch (error) {
      console.log(id);
    }
  };
  findLocationByDistricts = async (id: string) => {
    try {
      const res = await this.db.find({
        where: {
          district: id,
        },
      });
      return res;
    } catch (error) {
      console.log(id);
    }
  };

  findAll = async () => {
    return await this.db.find({
      //   relations: [''],
    });
  };
  findById = async (id: number) => {
    return await this.db.findOne({
      where: {
        id: id,
      },
    });
  };
  findOne = async (id: string) => {
    return await this.db.findOne({
      where: {
        town: id,
      },
      //   relations: ['level'],
    });
  };
  findByName = async (
    name: string,
    town: string,
    english: string,
    district: string,
  ) => {
    return await this.db.findOne({
      where: {
        name: name,
        town: town,
        englishNameOfTown: english,
        district: district,
      },
    });
  };
  findByNameWithout = async (name: string, district: string) => {
    return await this.db.findOne({
      where: {
        name: name,
        town: IsNull(),
        district: district,
      },
    });
  };
}
