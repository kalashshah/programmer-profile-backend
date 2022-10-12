import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello from B-704';
  }
  getHello2(): string {
    return '8 CPI Boi - Akhilesh Manda';
  }
}
