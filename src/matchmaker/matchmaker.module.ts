import { Module } from '@nestjs/common';
import { MatchmakerService } from './matchmaker.service';
import { MatchmakerController } from './matchmaker.controller';

@Module({
  controllers: [MatchmakerController],
  providers: [MatchmakerService],
})
export class MatchmakerModule {}
