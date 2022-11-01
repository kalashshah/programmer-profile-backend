import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from 'prisma/prisma.service';
import { decode } from 'src/constants/decode';
import { CLIST_API_KEY } from 'src/constants/env';
import { ClistContest, GetContestOutput } from 'src/graphql.types';

@Injectable()
export class ContestService {
  constructor(private readonly prisma: PrismaService) {}

  async getContests(token: string): Promise<GetContestOutput> {
    await decode(token, this.prisma);
    try {
      const res = await axios.get(
        `https://clist.by/api/v2/json/contest/?limit=1000&offset=1&with_problems=false&upcoming=true&order_by=start&ap/&username=kalash04&api_key=${CLIST_API_KEY}`,
      );
      const contests: ClistContest[] = res.data.objects;
      const result: GetContestOutput = {
        today: [],
        tomorrow: [],
        week: [],
        upcoming: [],
      };
      for (const contest of contests) {
        contest.start = new Date(contest.start);
        contest.end = new Date(contest.end);
        if (contest.start.getDate() === new Date().getDate()) {
          result.today.push(contest);
        } else if (contest.start.getDate() === new Date().getDate() + 1) {
          result.tomorrow.push(contest);
        } else if (contest.start.getDate() <= new Date().getDate() + 7) {
          result.week.push(contest);
        } else result.upcoming.push(contest);
      }
      return result;
    } catch (error) {
      return {
        today: [],
        tomorrow: [],
        week: [],
        upcoming: [],
      };
    }
  }
}
