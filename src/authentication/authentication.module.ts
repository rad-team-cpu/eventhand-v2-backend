import { Module } from '@nestjs/common';
import { AuthenticationGuard } from './authentication.guard';
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';

@Module({
  providers: [AuthenticationGuard, AuthenticationService],
  controllers: [AuthenticationController],
  exports: [AuthenticationService, AuthenticationGuard],
})
export class AuthenticationModule {}
