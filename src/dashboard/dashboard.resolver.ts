import { Context, Query, Resolver } from '@nestjs/graphql';
import { CodeforcesGraphsOutput, GithubGraphsOutput } from 'src/graphql.types';
import { DashboardService } from './dashboard.service';

@Resolver()
export class DashboardResolver {
  constructor(private readonly dashboardService: DashboardService) {}

  @Query('contributionGraph')
  async getContributionGraph(@Context() context) {
    const token = this.checkHeader(context?.req?.headers?.authorization);
    return this.dashboardService.getContributionGraph(token);
  }

  @Query('getPinnedRepos')
  async getPinnedRepos(@Context() context) {
    const token = this.checkHeader(context?.req?.headers?.authorization);
    return await this.dashboardService.getPinnedRepos(token);
  }

  @Query('codeforcesGraphs')
  async codeforcesGraphs(@Context() context): Promise<CodeforcesGraphsOutput> {
    const token = this.checkHeader(context?.req?.headers?.authorization);
    return await this.dashboardService.codeforcesGraphs(token);
  }

  @Query('githubGraphs')
  async githubGraphs(@Context() context): Promise<GithubGraphsOutput> {
    const token = this.checkHeader(context?.req?.headers?.authorization);
    return await this.dashboardService.githubGraphs(token);
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
