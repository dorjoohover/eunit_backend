import { Request } from 'express';

export class Client {
  id: number;
  email: string;
  name: string;
  profile: string;
  role: number;
  wallet: number;
  birthdate: string;
}

// export class MainUser {
//   // Merchant user
//   app: 'merchant' | 'dash';
//   client: Client;
// }

// export class TerminalUser {
//   client?: Client;
//   terminal: Terminal;
// }

export interface MainRequest extends Request {
  user: Client;
}

// export interface TerminalRequest extends Request {
//   user: TerminalUser;
// }
