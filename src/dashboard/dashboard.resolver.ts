import { Args, Context, Query, Resolver } from '@nestjs/graphql';
import { getToken } from 'src/constants/decode';
import {
  CodeforcesGraphsOutput,
  GithubGraphsOutput,
  LeetcodeGraphsOutput,
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
    const token = getToken(context);
    return this.dashboardService.getContributionGraph(input.userId, token);
  }

  @Query('getPinnedRepos')
  async getPinnedRepos(@Args('input') input: UserIdInput, @Context() context) {
    const token = getToken(context);
    return await this.dashboardService.getPinnedRepos(input.userId, token);
  }

  @Query('codeforcesGraphs')
  async codeforcesGraphs(
    @Args('input') input: UserIdInput,
    @Context() context,
  ): Promise<CodeforcesGraphsOutput> {
    const token = getToken(context);
    return await this.dashboardService.codeforcesGraphs(input.userId, token);
  }

  @Query('githubGraphs')
  async githubGraphs(
    @Args('input') input: UserIdInput,
    @Context() context,
  ): Promise<GithubGraphsOutput> {
    const token = getToken(context);
    return await this.dashboardService.githubGraphs(input.userId, token);
  }

  @Query('leetcodeGraphs')
  async leetcodeGraphs(
    @Args('input') input: UserIdInput,
    @Context() context,
  ): Promise<LeetcodeGraphsOutput> {
    const token = getToken(context);
    return await this.dashboardService.leetcodeGraphs(input.userId, token);
  }
}
