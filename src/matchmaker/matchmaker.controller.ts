import { Controller } from '@nestjs/common';
import { MatchmakerService } from './matchmaker.service';

@Controller('matchmaker')
export class MatchmakerController {
  constructor(private readonly matchmakerService: MatchmakerService) {}
}
