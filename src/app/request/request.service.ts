import { HttpException, Injectable } from '@nestjs/common';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { BaseService } from 'src/base/base.service';
import { RequestDao } from './request.dao';
import { TransactionService } from '../payment/transaction.service';
import { ServiceType } from 'src/base/constants';
import { AdService } from 'src/data/ad/ad.service';
import { LocationDao } from 'src/data/location/location.dao';

@Injectable()
export class RequestService extends BaseService {
  constructor(
    private dao: RequestDao,
    private adService: AdService,
    private locationDao: LocationDao,
    private transactionService: TransactionService,
  ) {
    super();
  }
  public async create(dto: CreateRequestDto, email: string, user: number) {
    const point =
      dto.service == ServiceType.REVIEW
        ? 2000
        : dto.service == ServiceType.DATA
          ? dto.count * 200
          : 20000;
    const success = await this.transactionService.create({
      point: point,
      receiver: 'bomarketm@gmail.com',
      remitter: email,
      message: 'Худалдан авалт хийсэн',
    });
    const res = await this.dao.create({
      ...dto,
      location: +dto.location,
      user: user,
    });
    await this.transactionService.updateRequest(success.id, res);
    return res;
  }

  findAll() {
    return `This action returns all request`;
  }

  async findByUser(id: number, page: number, limit = 10) {
    return await this.dao.findByUser(id, page, limit);
  }

  async findAllUser(user: number) {
    return await this.dao.findAllUser(user);
  }

  public async findOne(id: number) {
    const service = await this.dao.findOne(id);

    const location = await this.locationDao.findById(service.location.id);
    const res = await this.adService.calcData({
      area: service.area,
      location: service.location.id,
      type: service.service,
      endDate: service.endDate,
      startDate: service.startDate,
      paid: true,
    });
    console.log(res, service);
    return {
      data: {
        ...res,
        area: service.area,
        createdAt: service.createdAt,
        no: service.no,
        room: service.room,
        floor: service.floor,
      },
      location: location,
    };
  }

  update(id: number, updateRequestDto: UpdateRequestDto) {
    return `This action updates a #${id} request`;
  }

  remove(id: number) {
    return `This action removes a #${id} request`;
  }
}
