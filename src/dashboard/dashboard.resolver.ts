import { Args, Context, Query, Resolver } from '@nestjs/graphql';
import {
  CodeforcesGraphsOutput,
  GithubGraphsOutput,
  UserIdInput,
} from 'src/graphql.types';
import { DashboardService } from './dashboard.service';

@Resolver()
export class DashboardResolver {
  constructor(private readonly dashboardService: DashboardService) {}

  @Query('contributionGraph')
  async getContributionGraph(
    @Args('input') input: UserIdInput,
    @Context() context,
  ) {
    const token = this.checkHeader(context?.req?.headers?.authorization);
    return this.dashboardService.getContributionGraph(input.userId, token);
  }

  @Query('getPinnedRepos')
  async getPinnedRepos(@Args('input') input: UserIdInput, @Context() context) {
    const token = this.checkHeader(context?.req?.headers?.authorization);
    return await this.dashboardService.getPinnedRepos(input.userId, token);
  }

  @Query('codeforcesGraphs')
  async codeforcesGraphs(
    @Args('input') input: UserIdInput,
    @Context() context,
  ): Promise<CodeforcesGraphsOutput> {
    const token = this.checkHeader(context?.req?.headers?.authorization);
    return await this.dashboardService.codeforcesGraphs(input.userId, token);
  }

  @Query('githubGraphs')
  async githubGraphs(
    @Args('input') input: UserIdInput,
    @Context() context,
  ): Promise<GithubGraphsOutput> {
    console.log(input);
    const token = this.checkHeader(context?.req?.headers?.authorization);
    if (!input?.userId) throw new Error('Invalid request, userId not found');
    return await this.dashboardService.githubGraphs(input.userId, token);
  }

  checkHeader = (authorization: string) => {
    if (!authorization) {
      throw new Error('Not authenticated');
    }
    if (!authorization.startsWith('Bearer ')) {
      throw new Error('Invalid token');
    }
    const token = authorization.split(' ')[1];
    if (!token) {
      throw new Error('Invalid token');
    }
    return token;
  };
}
