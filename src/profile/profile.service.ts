import { Injectable } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

import { PrismaService } from 'prisma/prisma.service';
import { GITHUB_CLIENT_ID, GITHUB_SECRET_KEY } from 'src/constants/env';
import { AuthorizeGithubInput, AuthorizeGithubOutput } from 'src/graphql.types';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async authorizeGithub(
    data: AuthorizeGithubInput,
  ): Promise<AuthorizeGithubOutput> {
    const { userId } = data;
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
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
