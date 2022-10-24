import { Injectable } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

import { PrismaService } from 'prisma/prisma.service';
import { decode } from 'src/constants/decode';
import { GITHUB_CLIENT_ID, GITHUB_SECRET_KEY } from 'src/constants/env';
import { PAGINATION_LIMIT } from 'src/constants/constants';
import {
  AddUsernameInput,
  AuthorizeGithubOutput,
  RestrictedUser,
  Website,
} from 'src/graphql.types';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  /**
   * It takes in a user's token and returns a URL that the user can use to authorize their Github
   * account
   * @param {string} token - The JWT token that was generated when the user logged in.
   * @returns The state and the url
   */
  async authorizeGithub(token: string): Promise<AuthorizeGithubOutput> {
    const user = await decode(token, this.prisma);
    const userId = user.id;
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const state = this.createState(userId);
    await this.clearGithubAuthTokens(userId);
    const newState = encodeURIComponent(state);
    await this.prisma.githubAuth.create({
      data: {
        state: newState,
        userId,
      },
    });
    return {
      state: newState,
      url: `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&state=${newState}`,
    };
  }

  /**
   * It takes in a token and a username and platform, and updates the user's username for that platform
   * @param {AddUsernameInput} data - AddUsernameInput
   * @param {string} token - The token that was generated when the user logged in.
   * @returns A string
   */
  async addUsername(data: AddUsernameInput, token: string): Promise<string> {
    const user = await decode(token, this.prisma);
    const userId = user.id;
    const { username, platform } = data;
    if (!username || !platform) {
      throw new BadRequestException('Username and platform are required');
    }
    if (platform === Website.CODEFORCES) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { codeforcesUsername: username },
      });
    } else if (platform === Website.LEETCODE) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { leetcodeUsername: username },
      });
    } else {
      throw new BadRequestException('Invalid platform');
    }
    return 'Username added successfully';
  }

  async search(query: string, page: number): Promise<RestrictedUser[]> {
    const users = await this.prisma.user.findMany({
      where: {
        isVerified: true,
        OR: [
          {
            codeforcesUsername: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            leetcodeUsername: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            name: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            email: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
      },
      orderBy: {
        name: 'asc',
      },
      skip: (page - 1) * PAGINATION_LIMIT,
      take: PAGINATION_LIMIT,
      distinct: ['id'],
      select: {
        id: true,
        name: true,
        email: true,
        codeforcesUsername: true,
        leetcodeUsername: true,
        description: true,
        profilePicture: true,
      },
    });
    return users;
  }

  async getUser(token: string) {
    return await decode(token, this.prisma);
  }

  /**
   * It deletes all GithubAuth records that were created more than 10 minutes ago
   * and that belong to the given userId.
   * @param {string} userId - The user's ID.
   */
  async clearGithubAuthTokens(userId: string) {
    await this.prisma.githubAuth.deleteMany({
      where: {
        createdAt: {
          lte: new Date(Date.now() - 10 * 60 * 1000),
        },
      },
    });
    await this.prisma.githubAuth.deleteMany({
      where: { userId },
    });
  }

  /**
   * It takes a userId and returns a signed JWT
   * @param {string} userId - The user's ID.
   * @returns A JWT token that contains the userId.
   */
  createState(userId: string) {
    return jwt.sign({ userId }, GITHUB_SECRET_KEY);
  }
}
