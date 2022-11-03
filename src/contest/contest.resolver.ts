import { Context, Query, Resolver } from '@nestjs/graphql';
import { GetContestOutput } from 'src/graphql.types';
import { ContestService } from './contest.service';
import { getToken } from 'src/constants/decode';

@Resolver()
export class ContestResolver {
  constructor(private readonly contestService: ContestService) {}

  @Query('getContests')
  async getContests(@Context() context): Promise<GetContestOutput> {
    const token = getToken(context);
    return await this.contestService.getContests(token);
  }
}
