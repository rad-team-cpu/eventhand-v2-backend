import { Controller, Get, Param } from '@nestjs/common';
import { MatchmakerService } from './matchmaker.service';
import { Package } from 'src/packages/entities/package.schema';

@Controller('matchmaker')
export class MatchmakerController {
  constructor(private readonly matchmakerService: MatchmakerService) {}

  @Get(':id')
  async match(@Param('id') eventId: string): Promise<Package[]> {
    return await this.matchmakerService.findMatchingVendorsAndPackages(eventId);
  }
}
