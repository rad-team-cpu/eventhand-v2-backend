import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { MatchmakerService } from './matchmaker.service';
import { Package } from 'src/packages/entities/package.schema';
import { AuthenticationGuard } from 'src/authentication/authentication.guard';

@UseGuards(AuthenticationGuard)
@Controller('matchmaker')
export class MatchmakerController {
  constructor(private readonly matchmakerService: MatchmakerService) {}

  @Get(':id')
  async match(@Param('id') eventId: string) {
    return await this.matchmakerService.findAvailablePackages(eventId);
  }
}
