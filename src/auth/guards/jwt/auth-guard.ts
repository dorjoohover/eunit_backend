import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { Reflector } from '@nestjs/core';
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly service: AuthService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    if (!authHeader) return false;

    const token = authHeader.split(' ')[1];
    try {
      const res = await this.service.verifyRefreshToken(token);
      if (res == null) {
        // throw new HttpException('', HttpStatus.BAD_REQUEST);
        return false
      }
      const user = await this.service.getUser(res.email);
      // password hash-ийг request.user-ээс хасна — эс тэгвэл findMe гэх мэт
      // "@Request() { user }"-ийг шууд буцаадаг route-уудаар алдагдана.
      const { password, ...safeUser } = user ?? {};
      request.user = safeUser;

      return true;
    } catch (error) {
      console.log(error);
      if (error.code == 'auth/id-token-expired') {
        // return true
        throw new HttpException('expired', HttpStatus.UNAUTHORIZED);
      }
      return false;
    }
  }
}
