import { Test, TestingModule } from '@nestjs/testing';
import { AdharVerificationService } from './adhar_verification.service';

describe('AdharVerificationService', () => {
  let service: AdharVerificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdharVerificationService],
    }).compile();

    service = module.get<AdharVerificationService>(AdharVerificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
