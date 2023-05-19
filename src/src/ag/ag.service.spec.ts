import { Test, TestingModule } from '@nestjs/testing';
import { AgService } from './ag.service';

describe('AgService', () => {
  let service: AgService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AgService],
    }).compile();

    service = module.get<AgService>(AgService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
