import { Controller, Get, Post } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';

@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly AuthenticationService: AuthenticationService) {}

  @Get()
  async createTestingToken() {
    return await this.AuthenticationService.generateToken();
  }
}
