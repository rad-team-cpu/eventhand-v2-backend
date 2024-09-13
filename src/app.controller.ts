import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthenticationGuard } from './authentication/authentication.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @UseGuards(AuthenticationGuard)
  @Get('/helloworld')
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/healthcheck')
  HealthCheck(): string {
    return this.appService.healthCheck();
  }
}
