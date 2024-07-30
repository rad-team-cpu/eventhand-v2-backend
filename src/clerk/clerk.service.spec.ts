import { Test, TestingModule } from '@nestjs/testing';
import { WebhookService as ClerkService } from './clerk.service';

describe('ClerkService', () => {
  let service: ClerkService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClerkService],
    }).compile();

    service = module.get<ClerkService>(ClerkService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
