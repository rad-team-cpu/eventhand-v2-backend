import { Controller, Get, Param } from '@nestjs/common';
import { MatchmakerService } from './matchmaker.service';
import { Vendor } from 'src/vendors/entities/vendor.schema';

@Controller('matchmaker')
export class MatchmakerController {
  constructor(private readonly matchmakerService: MatchmakerService) {}

  @Get(':id')
  async match(@Param('id') eventId: string): Promise<Vendor[]> {
    return await this.matchmakerService.bruteforceSearch(eventId);
  }
}
