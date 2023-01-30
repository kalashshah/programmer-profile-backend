import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from 'prisma/prisma.service';
import { decode } from 'src/constants/decode';
import { CLIST_API_KEY } from 'src/constants/env';
import { ClistContest, GetContestOutput } from 'src/graphql.types';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class ContestService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * It fetches all the contests from clist.by and sorts them into different categories according to their start date.
   * @param {string} token - The token that is generated when a user logs in.
   */
  async getContests(token: string): Promise<GetContestOutput> {
    await decode(token, this.prisma);
    try {
      const res = await axios.get(
        `https://clist.by/api/v2/json/contest/?limit=1000&offset=1&with_problems=false&upcoming=true&order_by=start&ap/&username=kalash04&api_key=${CLIST_API_KEY}`,
      );
      const contests: ClistContest[] = res.data.objects;
      const result: GetContestOutput = {
        active: [],
        today: [],
        tomorrow: [],
        week: [],
        upcoming: [],
      };
      contests.sort(
        (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
      );
      for (const contest of contests) {
        contest.start = new Date(contest.start);
        const today = new Date();
        const tomorrow = new Date();
        const week = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        week.setDate(week.getDate() + 7);
        let isActive = false;
        if (contest.start < today) {
          isActive = true;
          result.active.push(contest);
        }
        if (
          contest.start.getDate() === today.getDate() &&
          contest.start.getMonth() === today.getMonth() &&
          contest.start.getFullYear() === today.getFullYear()
        )
          result.today.push(contest);
        else if (
          contest.start.getDate() === tomorrow.getDate() &&
          contest.start.getMonth() === tomorrow.getMonth() &&
          contest.start.getFullYear() === tomorrow.getFullYear()
        )
          result.tomorrow.push(contest);
        else if (
          contest.start.getDate() <= week.getDate() &&
          contest.start.getMonth() <= week.getMonth() &&
          contest.start.getFullYear() <= week.getFullYear()
        )
          result.week.push(contest);
        else if (!isActive) result.upcoming.push(contest);
      }
      return result;
    } catch (error) {
      throw new BadRequestException(
        'Something went wrong while fetching contests',
      );
    }
  }
}
