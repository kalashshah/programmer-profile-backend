import { Context, Query, Resolver } from '@nestjs/graphql';
import { GetContestOutput } from 'src/graphql.types';
import { ContestService } from './contest.service';
import { BadRequestException } from '@nestjs/common';

@Resolver()
export class ContestResolver {
  constructor(private readonly contestService: ContestService) {}

  @Query('getContests')
  async getContests(@Context() context): Promise<GetContestOutput> {
    const token = context?.req?.headers?.authorization.split(' ')[1];
    if (!token) {
      throw new BadRequestException('Invalid token');
    }
    return await this.contestService.getContests(token);
  }
}
