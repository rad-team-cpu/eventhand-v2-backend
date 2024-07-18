import { Test, TestingModule } from '@nestjs/testing';
import { MatchmakerController } from './matchmaker.controller';
import { MatchmakerService } from './matchmaker.service';

describe('MatchmakerController', () => {
  let controller: MatchmakerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MatchmakerController],
      providers: [MatchmakerService],
    }).compile();

    controller = module.get<MatchmakerController>(MatchmakerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
