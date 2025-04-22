import { Injectable } from '@nestjs/common';
import {
  Between,
  DataSource,
  In,
  IsNull,
  LessThan,
  MoreThan,
  Not,
  Repository,
} from 'typeorm';
import { AdEntity } from './entities/ad.entity';
import { CreateAdDto } from './dto/create-ad.dto';

@Injectable()
export class AdDao {
  private db: Repository<AdEntity>;
  constructor(private dataSource: DataSource) {
    this.db = this.dataSource.getRepository(AdEntity);
  }

  create = async (dto: CreateAdDto) => {
    try {
      const res = await this.db.insert({
        ...dto,
        unitPrice: Math.round(dto.unitPrice) ?? dto.price / dto.area,
      });
    } catch (error) {
      console.log(error);
    }
  };

  findAll = async () => {
    return await this.db.find({
      //   relations: [''],
    });
  };

  findOne = async (id: number) => {
    return await this.db.findOne({
      where: {
        id: id,
      },
      //   relations: ['level'],
    });
  };
  countDataLocationId = async (locations: number[]) => {
    return await this.db
      .createQueryBuilder('ad')
      .select('COUNT(ad."locationId")', 'count')
      .where('ad."locationId" IN (:...ids)', { ids: locations })
      .getRawMany();
  };
  dataLocationId = async (locations: number[]) => {
    return await this.db
      .createQueryBuilder('ad')
      .select('AVG(ad."unitPrice")', 'avg') // Compute average
      .addSelect('COUNT(ad."unitPrice")', 'count') // Compute count
      .where('ad."locationId" IN (:...ids)', { ids: locations })
      .getRawOne(); // Fetch single result
  };

  findReview = async (
    location: number[],
    lowArea: number,
    startDate?: Date,
    endDate?: Date,
    all?: boolean,
  ) => {
    const res =
      startDate && endDate
        ? await this.db.find({
            where: {
              location: {
                id: In(location),
              },
              area: all
                ? Not(IsNull())
                : lowArea <= 80
                  ? LessThan(80)
                  : MoreThan(80),
              date: Between(startDate, endDate),
            },
            select: {
              uneguiId: false,
              createdAt: false,
              title: false,
            },
            order: {
              date: 'DESC',
            },
            relations: ['location'],
          })
        : await this.db.find({
            where: {
              location: {
                id: In(location),
              },
              area:
                lowArea == 0
                  ? Not(IsNull())
                  : lowArea <= 80
                    ? LessThan(80)
                    : MoreThan(80),
            },

            order: {
              date: 'DESC',
            },
            select: {
              uneguiId: false,
              createdAt: false,
              title: false,
            },
          });
    return res;
  };
}
