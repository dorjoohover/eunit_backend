import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { AppExcel } from './common/app.excel';
import { Public } from './auth/guards/jwt/jwt-auth-guard';
import { AuthService } from './auth/auth.service';
import { LoginUserDto } from './auth/auth.dto';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private excel: AppExcel,
    private authService: AuthService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Public()
  @Post('login')
  async login(@Body() dto: LoginUserDto) {
    return await this.authService.login(dto);
  }
}
