import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { decode } from 'src/constants/decode';
import {
  getCodeforcesContributionGraph,
  getGithubContributionGraph,
  getGithubUsername,
  getLeetcodeContributionGraph,
  pinnedRepos,
  getCFRatingGraph,
  getCFTagandProblemGraph,
} from 'src/constants/profile.data';
import {
  CodeforcesGraphsOutput,
  ContributionGraph,
  User,
} from 'src/graphql.types';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getContributionGraph(token: string): Promise<ContributionGraph> {
    const user = await decode(token, this.prisma);
    const contributionGraph: ContributionGraph = {
      totalContributions: 0,
      contributions: [],
    };
    for (let i = 364; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      contributionGraph.contributions.push({
        date: date.toISOString().split('T')[0],
        codeforcesContributions: 0,
        githubContributions: 0,
        leetcodeContributions: 0,
      });
    }
    await Promise.all([
      this.fillCodeforcesData(user, contributionGraph),
      this.fillGithubData(user, contributionGraph),
      this.fillLeetcodeData(user, contributionGraph),
    ]);
    return contributionGraph;
  }

  async getPinnedRepos(token: string) {
    const user = await decode(token, this.prisma);
    if (user.githubToken) {
      try {
        const githubUsername = await getGithubUsername(user.githubToken);
        return await pinnedRepos(githubUsername, user.githubToken);
      } catch (err) {
        throw new Error('Github token is invalid');
      }
    }
    return [];
  }

  async codeforcesGraphs(token: string): Promise<CodeforcesGraphsOutput> {
    const user = await decode(token, this.prisma);
    if (user.codeforcesUsername) {
      try {
        const [ratings, tagAndRatingGraph] = await Promise.all([
          getCFRatingGraph(user.codeforcesUsername),
          getCFTagandProblemGraph(user.codeforcesUsername),
        ]);
        return {
          ratingGraph: { ratings: ratings || [] },
          barGraph: { problemRatingGraph: tagAndRatingGraph.ratingArray || [] },
          donutGraph: { problemTagGraph: tagAndRatingGraph.tagArray || [] },
        };
      } catch (err) {
        throw new Error('Codeforces username is invalid');
      }
    }
    return {
      barGraph: { problemRatingGraph: [] },
      donutGraph: { problemTagGraph: [] },
      ratingGraph: { ratings: [] },
    };
  }

  async fillCodeforcesData(user: User, contributionGraph: ContributionGraph) {
    if (user.codeforcesUsername) {
      try {
        const codeforcesData = await getCodeforcesContributionGraph(
          user.codeforcesUsername,
        );
        let totalCodeforcesContributions = 0;
        for (const submission of codeforcesData) {
          if (submission.verdict === 'OK') {
            const date = new Date(submission.creationTimeSeconds * 1000);
            const index = contributionGraph.contributions.findIndex(
              (contribution) =>
                contribution.date === date.toISOString().split('T')[0],
            );
            if (index !== -1) {
              contributionGraph.contributions[index].codeforcesContributions++;
              totalCodeforcesContributions++;
            }
          }
        }
        contributionGraph.totalCodeforcesContributions =
          totalCodeforcesContributions;
        contributionGraph.totalContributions += totalCodeforcesContributions;
      } catch (error) {}
    }
  }

  async fillLeetcodeData(user: User, contributionGraph: ContributionGraph) {
    if (user.leetcodeUsername) {
      try {
        const leetcodeData = await getLeetcodeContributionGraph(
          user.leetcodeUsername,
        );
        let totalLeetcodeContributions = 0;
        for (const key in leetcodeData) {
          const date = new Date(parseInt(key, 10) * 1000);
          console.assert(!isNaN(date.getTime()));
          const check = date.toISOString().split('T')[0];
          const index = contributionGraph.contributions.findIndex(
            (contribution) => contribution.date === check,
          );
          if (index !== -1) {
            contributionGraph.contributions[index].leetcodeContributions =
              leetcodeData[key];
            totalLeetcodeContributions += leetcodeData[key];
          }
        }
        contributionGraph.totalLeetcodeContributions =
          totalLeetcodeContributions;
        contributionGraph.totalContributions += totalLeetcodeContributions;
      } catch (err) {}
    }
  }

  async fillGithubData(user: User, contributionGraph: ContributionGraph) {
    if (user.githubToken) {
      try {
        const githubUsername = await getGithubUsername(user.githubToken);
        const githubContributionData = await getGithubContributionGraph(
          githubUsername,
          user.githubToken,
        );
        let totalGithubContributions = 0;
        for (let i = 0; i < githubContributionData.weeks.length; i++) {
          for (
            let j = 0;
            j < githubContributionData.weeks[i].contributionDays.length;
            j++
          ) {
            const date =
              githubContributionData.weeks[i].contributionDays[j].date;
            const index = contributionGraph.contributions.findIndex(
              (contribution) => contribution.date === date,
            );
            if (index !== -1) {
              contributionGraph.contributions[index].githubContributions =
                githubContributionData.weeks[i].contributionDays[
                  j
                ].contributionCount;
              totalGithubContributions +=
                githubContributionData.weeks[i].contributionDays[j]
                  .contributionCount;
            }
          }
        }
        contributionGraph.totalGithubContributions = totalGithubContributions;
        contributionGraph.totalContributions += totalGithubContributions;
      } catch (err) {}
    }
  }
}
