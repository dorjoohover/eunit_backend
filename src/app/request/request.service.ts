import { HttpException, Injectable } from '@nestjs/common';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { BaseService } from 'src/base/base.service';
import { RequestDao } from './request.dao';
import { TransactionService } from '../payment/transaction.service';
import { ServiceType } from 'src/base/constants';
import { AdService } from 'src/data/ad/ad.service';
import { LocationDao } from 'src/data/location/location.dao';
import PdfPrinter from 'pdfmake';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { RequestReport } from './request.pdf';
import { Formatter } from './formatter';
const fonts = {
  Roboto: {
    normal: 'src/fonts/Roboto-Regular.ttf',
    bold: 'src/fonts/Roboto-Medium.ttf',
    italics: 'src/fonts/Roboto-Italic.ttf',
    bolditalics: 'src/fonts/Roboto-MediumItalic.ttf',
  },
};
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

  private printer = new PdfPrinter(fonts);

  createPdf(docDefinition: TDocumentDefinitions) {
    return this.printer.createPdfKitDocument(docDefinition);
  }

  async getPdf(id: number): Promise<PDFKit.PDFDocument> {
    const res = await this.findOne(id);
    const docDefinition = RequestReport({
      location: Formatter.location(
        res.location.city,
        res.location.district,
        res.location.town,
        res.location.khoroo,
      ),
      text: Formatter.text(
        res.location.city,
        res.location.district,
        res.location.khoroo,
        res.location.zipcode,
        res.location.town,
        res.data.area * res.data.avg,
        res.data.area,
        res.data.room,
        res.data.floor,
        res.data.no,
      ),
      town: res.location.town,
      type: 'Орон сууц',
      user: {
        email: res.user.email,
        name: Formatter.userName(
          res.user.name,
          res.user.lastname,
          res.user.firstname,
        ),
        phone: res.user.phone ?? '',
      },
      value: {
        area: res.data.area,
        avg: res.data.avg,
        max: res.data.max,
        min: res.data.min,
      },
    });

    return this.createPdf(docDefinition);
  }
  public async create(dto: CreateRequestDto, email: string, user: number) {
    try {
      const point =
        dto.service == ServiceType.REVIEW
          ? 1000
          : dto.service == ServiceType.DATA
            ? dto.count * 100
            : 20000;
      const success = await this.transactionService.create({
        point: point,
        receiver: 'bomarketm@gmail.com',
        remitter: email,
        message: 'Худалдан авалт хийсэн',
      });
      if (success?.id) {
        const res = await this.dao.create({
          ...dto,
          location: +dto.location,
          user: user,
        });
        await this.transactionService.updateRequest(success.id, res);
        return res;
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
        status: error.status,
      };
    }
  }

  async findAll() {
    return await this.dao.findAll();
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
    const res = (await this.adService.calcData({
      area: service.area,
      location: service.location.id,
      type: service.service,
      endDate: service.endDate,
      startDate: service.startDate,
      paid: true,
    })) as { min: number; max: number; avg: number };
    return {
      data: {
        ...res,
        area: service.area,
        createdAt: service.createdAt,
        no: service.no,
        room: service.room,
        floor: service.floor,
      },
      user: service.user,
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
