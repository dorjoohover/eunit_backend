import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/app/user/user.service';
import { LoginUserDto } from './auth.dto';
import { jwtConstants } from './constants';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(dto: LoginUserDto): Promise<any> {
    const { password, email, name, profile } = dto;
    let user = await this.usersService.getUser(email);
    if (!user) {
      user = await this.usersService.create({
        email: email,
        name,
        profile,
        // role: 10,
      });
    }

    let isMatch = false;
    // if (user) {
    //   if (password != null && password != undefined) {
    //     isMatch = await bcrypt.compare(password, user.password);
    //   } else {
    //     isMatch = true;
    //   }
    // } else {
    //   if (password == null || password == undefined) {
    //     await this.usersService.create({
    //       email: email,
    //       name,
    //       profile,
    //       // role: 10,
    //     });
    //     return true;
    //   }
    // }
    // if (user && isMatch == true) {
    //   const { password, ...result } = user;
    //   return result;
    // }
    return user;
  }

  async login(user: any) {
    const result = await this.validateUser(user);
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
