import {
  Get,
  HttpException,
  HttpStatus,
  Injectable,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/app/user/user.service';
import { LoginUserDto, RegisterUserDto } from './auth.dto';

import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
  private app: admin.app.App;
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    if (!admin.apps.length) {
      this.app = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID as string,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL as string,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    } else {
      this.app = admin.app();
    }
  }

  async verifyToken(idToken: string) {
    // let user = await
    let user = await this.app.auth().verifyIdToken(idToken);
    try {
      if (user?.uid) {
        let res = await this.usersService.getUser(
          user.phone_number ?? user.email,
        );

        if (!res)
          res = await this.usersService.create({
            email: user.email,
            phone: user.phone_number,
            profile: user.picture,
            name: user.name,
            lastname: user.name,
          });
        return {
          ...res,
          registered: true,
        };
      }
      throw new HttpException('Амжилтгүй', HttpStatus.BAD_REQUEST);
    } catch (error) {
      if (user?.uid) {
        const { phone_number, ...body } = user;
        return {
          ...body,
          phone: phone_number,
          registered: false,
        };
      }
      throw error;
    }
  }

  async register(dto: RegisterUserDto, phone: string, email: string) {
    return await this.usersService.create({
      ...dto,
      phone: phone,
      email: email,
    });
  }
  async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  async verifyRefreshToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      // throw new UnauthorizedException('Invalid refresh token');
      return null;
    }
  }
  // @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    return { message: 'Authenticated User', user: req.user };
  }
  async validateUser(dto: LoginUserDto): Promise<any> {
    const { password, email, name, profile } = dto;
    console.log('validateUser', dto, email, typeof email, name, profile);
    const user = await this.usersService.getUser(email);

    if (!user) {
      // Шинэ хэрэглэгч — үргэлж Client эрхтэй үүснэ (role-ийг
      // UserDao.add дотор шууд CLIENT болгодог), нууц үгийг өгсөн бол
      // hash хийж хадгална.
      const created = await this.usersService.create({
        email,
        name,
        profile,
        wallet: 0,
        password,
      });
      return created;
    }

    if (!password || !user.password) {
      return null;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return null;
    }

    const { password: _pw, ...result } = user;
    return result;
  }

  async getUser(email: string) {
    return await this.usersService.getUser(email);
  }

  async login(user: any) {
    const result = await this.validateUser(user);
    console.log('login result', result);
    if (!result) {
      throw new UnauthorizedException();
    }
    const token = this.jwtService.sign({
      app: 'app',
      email: result.email,
    });
    return {
      accessToken: token,
      user: {
        name: result.name,
        role: result.role,
        email: result.email,
        profile: result.profile,
        birthdate: result.birthdate,
        lastname: result.lastname,
        firstname: result.firstname,
        wallet: result.wallet,
        createdAt: result.createdAt,
      },
    };
  }
}
