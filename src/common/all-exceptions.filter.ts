import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { AppLogger } from '../base/logger';
const logger = new AppLogger();

@Catch(Error)
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: Error, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();
    try {
      const request = ctx.getRequest<Request>();
      logger.error({
        message: 'Unhandled exception',
        event: 'unhandled',
        client: ctx.getRequest()?.user,
        stack: exception.stack,
        url: request.url,
      });
    } catch {}

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = {
      succeed: false,
      message: exception.message || 'Системийн алдаа',
      statusCode: httpStatus,
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
