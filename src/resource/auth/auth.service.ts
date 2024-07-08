import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
// import * as bcrypt from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { Model } from 'mongoose';
import appConfig from '../../config/app.config';
import { UserStatus, UserType } from '../../utils/enum';
import { User, UserDocument } from '../../schema';
import { UserService } from '../user/user.service';
import { LoginUser, RegisterUser } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private model: Model<UserDocument>,
    private userService: UserService,
  ) {}
  async signPayload(payload: string) {
    return sign(payload, appConfig().appSecret);
  }

  async validateUser(payload: string) {
    let user = await this.model.findOne({ email: payload });
    if (!user)
      throw new HttpException('user not found', HttpStatus.BAD_REQUEST);
    return user;
  }
  async register(dto: RegisterUser) {
    try {
      if (dto.email != null || (dto.phone != null && dto.password != null)) {
        // const hashed = await bcrypt.hash(dto.password, 10);
        // let user = await this.userService.getUserByEmailOrPhone(dto.email);
        // if (user)
        //   throw new HttpException('registered user', HttpStatus.BAD_REQUEST);
        // if (hashed) {
        //   const createdUser = await this.model.create({
        //     username: dto.username,
        //     email: dto.email,
        //     phone: dto.phone,
        //     password: hashed,
        //     point: 10000,
        //     userType: UserType.default,
        //   });
        //   return createdUser;
        return true
        } else {
          throw new HttpException('did not hash password', 500);
        }
    //   }
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.FORBIDDEN);
    }
  }

  async registerGoogle(dto: LoginUser) {
    try {
      return await this.model.create({
        username: dto.name,
        email: dto.email,
        profileImg: dto.profileImg,
        userType: UserType.default,
        status: UserStatus.active,
        point: 10000,
      });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.FORBIDDEN);
    }
  }

  async login(dto: LoginUser) {
    try {
      dto.email = dto.email.toLowerCase()
      if (dto.email != null) {
        let user = await this.model.findOne({ email: dto.email });

        if (!user) user = await this.registerGoogle(dto);
        if (user.status == UserStatus.banned)
          return { status: false, message: 'banned' };
        return { status: true, user: user };
      }
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.FORBIDDEN);
    }
  }
}
