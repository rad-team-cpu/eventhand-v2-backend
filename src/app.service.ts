import { Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AppService {
  getHello(req: Request): any {
    console.log(req.body);
  }

  healthCheck(): string {
    return 'ok';
  }
}
