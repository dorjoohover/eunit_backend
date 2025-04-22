import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { AppExcel } from './common/app.excel';
import { Public } from './auth/guards/jwt/auth-guard';
import { AuthService } from './auth/auth.service';
import { LoginUserDto } from './auth/auth.dto';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private excel: AppExcel,
    private authService: AuthService,
  ) {}
  @Public()
  @Get()
  async getBillReport(@Res() response: Response) {
    // const pdfDoc = await this.appService.getBillReport();

    // response.setHeader('Content-Type', 'application/pdf');
    // pdfDoc.info.Title = 'Factura';
    // pdfDoc.pipe(response);
    // pdfDoc.end();
  }

  @Public()
  @Post('login')
  async login(@Body() dto: LoginUserDto) {
    return await this.authService.login(dto);
  }
}
