import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthenticationGuard } from './authentication/authentication.guard';
import { Request } from 'express';
import { Roles } from './roles/roles.decorator';
import { Role } from './roles/roles.enum';
import { RolesGuard } from './roles/roles.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @UseGuards(AuthenticationGuard, RolesGuard)
  @Roles(Role.Admin)
  @Get('/helloworld')
  getHello(@Req() req: Request): any {
    return this.appService.getHello(req);
  }

  @Get('/healthcheck')
  HealthCheck(): string {
    return this.appService.healthCheck();
  }
}
