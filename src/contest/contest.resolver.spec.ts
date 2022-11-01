import { Test, TestingModule } from '@nestjs/testing';
import { ContestResolver } from './contest.resolver';
import { ContestService } from './contest.service';

describe('ContestResolver', () => {
  let resolver: ContestResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContestResolver, ContestService],
    }).compile();

    resolver = module.get<ContestResolver>(ContestResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
