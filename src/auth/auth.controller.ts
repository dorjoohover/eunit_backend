import {
  Controller,
  Post,
  Body,
  Get,
  Request,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { RegisterUserDto, Token } from './auth.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from 'src/app/user/user.service';
import { AuthService } from './auth.service';
import { Public } from './guards/jwt/auth-guard';

@Controller('auth')
@ApiBearerAuth('access-token')
export class AuthController {
  constructor(private readonly service: AuthService) {}
  @Get('phone-login')
  async phoneLogin(@Request() { user }) {
    return user;
  }

  @Post('register')
  async register(@Body() dto: RegisterUserDto, @Request() { user }) {
    if (user.registered) {
      throw new HttpException(
        'Бүртгэлтэй хэрэглэгч байна.',
        HttpStatus.CONFLICT,
      );
    }
    const res = await this.service.register(dto, user['phone']);
    return res;
  }
}
