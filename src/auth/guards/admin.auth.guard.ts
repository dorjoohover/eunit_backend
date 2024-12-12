import {
  Injectable,
  ExecutionContext,
  CanActivate,
  UnauthorizedException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ADMIN } from 'src/base/constants';
import { MainRequest } from 'src/common/extentions';

export const IS_PUBLIC_KEY = 'isApiPublic';
export const ApiPublic = () => SetMetadata(IS_PUBLIC_KEY, true);

@Injectable()
export class AdminDashAuthGuard1 implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isApiPublic = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (isApiPublic) {
      return true;
    }

    const req: MainRequest = context.switchToHttp().getRequest();
    if (req.user.role === ADMIN) {
      return true;
    }
    throw new UnauthorizedException();
  }
}
