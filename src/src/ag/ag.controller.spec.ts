import { Test, TestingModule } from '@nestjs/testing';
import { AgController } from './ag.controller';

describe('AgController', () => {
  let controller: AgController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AgController],
    }).compile();

    controller = module.get<AgController>(AgController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
