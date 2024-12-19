import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { jwtConstants } from 'src/auth/constants';
import { UserService } from 'src/app/user/user.service';
import { Client, MainRequest } from 'src/common/extentions';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
      passReqToCallback: true,
    });
  }

  async validate(req: MainRequest, payload: any) {
    console.log(payload);
    let user = await this.usersService.getUser(payload?.result?.email);
    console.log(user);

    if (!user) {
      throw new UnauthorizedException();
    }
    const { password, ...result } = user;

    return <Client>{ ...result, app: 'app' };
  }
}
