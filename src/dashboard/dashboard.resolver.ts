import { Context, Query, Resolver } from '@nestjs/graphql';
import { DashboardService } from './dashboard.service';

@Resolver()
export class DashboardResolver {
  constructor(private readonly dashboardService: DashboardService) {}

  @Query('contributionGraph')
  async getContributionGraph(@Context() context) {
    const token = this.checkHeader(context.req.headers.authorization);
    return this.dashboardService.getContributionGraph(token);
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
