import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { MatchmakerService } from './matchmaker.service';
import { Package } from 'src/packages/entities/package.schema';
import { AuthenticationGuard } from 'src/authentication/authentication.guard';
import { RolesGuard } from 'src/roles/roles.guard';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/roles.enum';

@UseGuards(AuthenticationGuard, RolesGuard)
@Controller('matchmaker')
export class MatchmakerController {
  constructor(private readonly matchmakerService: MatchmakerService) {}

  @Roles(Role.Client)
  @Get(':id')
  async match(@Param('id') eventId: string) {
    return await this.matchmakerService.findAvailablePackages(eventId);
  }
}
