// import {
//   Injectable,
//   ExecutionContext,
//   SetMetadata,
//   CanActivate,
//   UnauthorizedException,
// } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';

// export const IS_PUBLIC_KEY = 'isTerminalPublic';
// export const TerminalPublic = () => SetMetadata(IS_PUBLIC_KEY, true);

// @Injectable()
// export class TerminalAuthGuard implements CanActivate {
//   constructor(
//     private reflector: Reflector,
//     private readonly userService: UserService,
//   ) {}

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const isTerminalPublic = this.reflector.getAllAndOverride<boolean>(
//       IS_PUBLIC_KEY,
//       [context.getHandler(), context.getClass()],
//     );
//     if (isTerminalPublic) {
//       return true;
//     }

//     const req = context.switchToHttp().getRequest();
//     const { employee: employeeCard, udid } = req.headers;
//     if (!udid) {
//       throw new UnauthorizedException();
//     }
//     const terminal = await this.terminalService.getByUdid(udid);
//     const merchant = await this.merchantService.get(terminal.merchantId);
//     req.user = <TerminalUser>{
//       terminal,
//       merchant,
//     };

//     return true;
//   }
// }
