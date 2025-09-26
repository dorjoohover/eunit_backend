import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  CarsDto,
  CreateRequestDto,
  RequetsFindDto,
} from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { BaseService } from 'src/base/base.service';
import { RequestDao } from './request.dao';
import { TransactionService } from '../payment/transaction.service';
import {
  PaymentStatus,
  PaymentType,
  SERVICE,
  ServiceType,
} from 'src/base/constants';
import { AdService } from 'src/data/ad/ad.service';
import { LocationDao } from 'src/data/location/location.dao';
import PdfPrinter from 'pdfmake';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { Formatter } from './formatter';
import { QpayService } from '../payment/qpay.service';
import { PdfService } from './pdf';
import { MailerService } from '@nestjs-modules/mailer';
import { CarsService } from './cars/cars.service';
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
    private pdfService: PdfService,
    private mailService: MailerService,
    private cars: CarsService,
  ) {
    super();
  }

  // private printer = new PdfPrinter(fonts);

  // createPdf(docDefinition: TDocumentDefinitions) {
  //   return this.printer.createPdfKitDocument(docDefinition);
  // }

  async getPdf(id: number) {
    const res = await this.findOne(id);

    return await this.pdfService.createPdf(res);
    // return {
    //   data: pdf,
    //   res,
    // };

    // const res = await this.findOne(id);
    // const docDefinition = RequestReport({
    //   location: Formatter.location(
    //     res.location.city,
    //     res.location.district,
    //     res.location.town,
    //     res.location.khoroo,
    //   ),
    //   text: Formatter.text(
    //     res.location.city,
    //     res.location.district,
    //     res.location.khoroo,
    //     res.location.zipcode,
    //     res.location.town,
    //     Math.round(
    //       (Number(res?.data.avg) || 0) *
    //         (parseFloat(`${res?.data.area}` || '0') || 0),
    //     ),

    //     res.data.area,
    //     res.data.room,
    //     res.data.floor,
    //     res.data.no,
    //   ),
    //   town: res.location.town,
    //   type: 'Орон сууц',
    //   user: {
    //     email: res.user.email,
    //     name: Formatter.userName(
    //       res.user.name,
    //       res.user.lastname,
    //       res.user.firstname,
    //     ),
    //     phone: res.user.phone ?? '',
    //   },
    //   value: {
    //     area: res.data.area,
    //     avg: res.data.avg,
    //     max: res.data.max,
    //     min: res.data.min,
    //   },
    // });

    // return this.createPdf(docDefinition);
  }
  public async create(dto: CreateRequestDto, email: string, user: number) {
    try {
      const point =
        dto.service == ServiceType.REVIEW
          ? dto.usage == 30 || !dto.usage
            ? 2000
            : 5000
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
          request: res,
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

  public async calculateCar(dto: CarsDto) {
    return await this.cars.calculate(dto);
  }

  public async sendPdf(id: number, email: string) {
    try {
      await this.mailService
        .sendMail({
          to: email,
          subject: 'Тайлан хүлээн авах',
          html: `<div>
      <p>Та тайлангаа <a href=https://srv666826.hstgr.cloud/api/v1/request/service/pdf/${id}>эндээс</a> татаж авна уу.</p>
      <p>Тайлан pdf хэлбэрээр татагдах болно.</p>
       <p>Асууж, тодруулах зүйл байвал <a href=mailto:info@eunit.mn>info@eunit.mn</a> хаягаар, <a href=tel:976-9599 2333>976-9599 2333</a> дугаараар холбогдоорой. </p>
       <p>Манайхаар үйлчлүүлж байгаад тань баярлалаа.</p>
       <p>Шуудангийн хаяг: Улаанбаатар хот, Сүхбаатар дүүрэг, 1-р хороо Энхтайвны өргөн чөлөө, UBH center, 12-р давхар, 1225 тоот, 14210, Ш/Н: Улаанбаатар</p>
       </div>`,
        })
        .catch((err) => console.log(err));
    } catch (error) {
      console.log(error);
    }
  }
  public async checkPayment(id: number, code: string, user: string) {
    const payment = await this.qpay.checkPayment(code);

    if (payment.paid_amount) {
      await this.dao.updateStatus(id, PaymentStatus.SUCCESS);
      const res = await this.transactionService.create({
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

  async findAll() {
    const res = await this.dao.findAll();
    return res;
  }

  async findByUser(id: number, page: number, limit = 10) {
    return await this.dao.findByUser(id, page, limit);
  }
  
  async find(id: number) {
    return await this.dao.findOne(id)
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
    if (service.result)
      return {
        service,
        result: { min: service.min, max: service.max, result: service.result },
      };
    if (service.category == SERVICE.CAR) {
      const res = await this.cars.calculate({
        brand: service.brand,
        capacity: service.capacity,
        color: service.color,
        mark: service.mark,
        manufacture: service.manufacture,
        gearbox: service.gearbox,
        engine: service.engine,
        entry: service.entry,
        hurd: service.hurd,
        // type: service.type,
        drive: service.drive,
        interior: service.interior,
        mileage: service.mileage,
        conditions: service.conditions,
      });
      const price = res * 0.95;
      await this.dao.updateResult(id, price);
      return {
        service,
        result: {
          result: price,
        },
      };
    }
    const location = await this.locationDao.findById(service.location.id);

    const res = (await this.adService.calcData({
      area: service.area,
      location: service.location.id,
      type: service.service,
      endDate: service.endDate,
      startDate: service.startDate,
      paid: true,
    })) as { min: number; max: number; avg: number };
    await this.dao.updateResult(id, res.avg, res.min, res.max);
    return {
      service,
      location,
      result: {
        min: res.min,
        max: res.max,
        result: res.avg,
      },
    };
  }

  update(id: number, updateRequestDto: UpdateRequestDto) {
    return `This action updates a #${id} request`;
  }

  remove(id: number) {
    return `This action removes a #${id} request`;
  }
}
