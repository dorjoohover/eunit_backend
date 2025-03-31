import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateRequestDto, RequetsFindDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { BaseService } from 'src/base/base.service';
import { RequestDao } from './request.dao';
import { TransactionService } from '../payment/transaction.service';
import { PaymentStatus, PaymentType, ServiceType } from 'src/base/constants';
import { AdService } from 'src/data/ad/ad.service';
import { LocationDao } from 'src/data/location/location.dao';
import PdfPrinter from 'pdfmake';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { RequestReport } from './request.pdf';
import { Formatter } from './formatter';
import { QpayService } from '../payment/qpay.service';
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
    private qpay: QpayService,
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
        Math.round(
          (Number(res?.data.avg) || 0) *
            (parseFloat(`${res?.data.area}` || '0') || 0),
        ),

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
          ? 2000
          : dto.service == ServiceType.DATA
            ? dto.count * 100
            : 20000;

      let success = null;
      const res = await this.dao.create({
        ...dto,
        location: +dto.location,
        user: user,
        status: PaymentStatus.PENDING,
      });

      if (dto.payment == PaymentType.POINT) {
        const transaction = await this.transactionService.create({
          point: -point,
          paymentType: dto.payment,
          user: email,
          message: 'Худалдан авалт хийсэн',
        });
        await this.dao.updateStatus(res, PaymentStatus.SUCCESS);
        return {
          res,
          data: transaction,
        };
      }

      if (dto.payment == PaymentType.QPAY) {
        const qpay = await this.qpay.createPayment(point, res.toString(), user);
        await this.dao.updateCode(res, qpay.invoice_id);
        return {
          res,
          data: qpay,
        };
      }
      await this.transactionService.updateRequest(success, res);
    } catch (error) {
      return {
        success: false,
        message: error.message,
        status: error.status,
      };
    }
  }
  public async checkPayment(id: number, code: string, user: string) {
    const payment = await this.qpay.checkPayment(code);
    if (payment.paid_amount) {
      await this.dao.updateStatus(id, PaymentStatus.SUCCESS);
      const transaction = await this.transactionService.findOneByRequest(id);
      if (!transaction)
        await this.transactionService.create({
          paymentType: PaymentType.QPAY,
          point: payment.paid_amount,
          user: user,
          request: id,
          message: 'Худалдан авалт хийсэн.',
        });
      return true;
    }
    return false;
  }

  async findAll(dto: RequetsFindDto) {
    const res = await this.dao.findAll(dto);
    const responses = [];
    const { data, ...body } = res;
    for (const r of data) {
      console.log(r)
      responses.push({
        id: r.id,
        user: r.user,
        price: r.transactions?.[0]?.point ?? 0,
        method: r.transactions?.[0]?.paymentType,
        date: r.createdAt,
        type: r.service,
      });
    }
    return {
      data: responses,
      ...body,
    };
  }

  async findByUser(id: number, page: number, limit = 10) {
    return await this.dao.findByUser(id, page, limit);
  }

  async findAllUser(user: number) {
    return await this.dao.findAllUser(user);
  }

  public async findOne(id: number) {
    const service = await this.dao.findOne(id);
    if (!service)
      throw new HttpException('Хайлт олдсонгүй.', HttpStatus.BAD_REQUEST);
    if (service.status != PaymentStatus.SUCCESS)
      throw new HttpException('Төлбөр төлөөгүй байна.', HttpStatus.BAD_REQUEST);
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
