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
  RestrictedUserOther,
  RestrictedUserSelf,
  ToggleFollowInput,
  Website,
} from 'src/graphql.types';
import { NotificationService } from 'src/notification/notification.service';
import { followingNotification } from 'src/constants/notifications';
import { HttpException, HttpStatus } from '@nestjs/common';
import { NotificationType } from 'src/graphql.types';

@Injectable()
export class ProfileService {
  constructor(
    private prisma: PrismaService,
    private notif: NotificationService,
  ) {}

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
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
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
      throw new HttpException(
        'Username and platform are required',
        HttpStatus.BAD_REQUEST,
      );
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
      throw new HttpException('Invalid platform', HttpStatus.BAD_REQUEST);
    }
    return 'Username added successfully';
  }

  /**
   * It searches for users based on the query, and returns the users in the page number specified
   * @param {string} query - The query string that the user is searching for.
   * @param {number} page - The page number of the search results.
   * @param {string} token - The token of the user who is searching for other users.
   * @returns An array of users that match the query.
   */
  async search(
    query: string,
    page: number,
    token: string,
  ): Promise<RestrictedUserOther[]> {
    const currentUser = await decode(token, this.prisma);
    const users = await this.prisma.user.findMany({
      where: {
        isVerified: true,
        OR: [
          { codeforcesUsername: { contains: query, mode: 'insensitive' } },
          { leetcodeUsername: { contains: query, mode: 'insensitive' } },
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: { followedByIds: 'desc' },
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
    const idSet = new Set(currentUser.followingIds);
    const result: RestrictedUserOther[] = [];
    for (const user of users) {
      if (user.id !== currentUser.id) {
        result.push({
          ...user,
          isFollowing: idSet.has(user.id),
        });
      }
    }
    return result;
  }

  /**
   * It takes a userId and toggles the follower-following relationship between the current user
   * and the user with the given userId.
   * @param {ToggleFollowInput} data - ToggleFollowInput
   * @param {string} token - The token that was generated when the user logged in.
   * @returns A string
   */
  async toggleFollow(data: ToggleFollowInput, token: string): Promise<string> {
    const user = await decode(token, this.prisma);
    const userId = user.id;
    const friendId = data.userId;
    if (friendId === userId) {
      throw new HttpException(
        'You cannot follow or unfollow yourself',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (data.action === 'ADD') {
      await this.addFollowing(userId, friendId);
      await this.addFollowedBy(userId, friendId);
      await this.notif.sendNotification(
        friendId,
        followingNotification(user.name),
        NotificationType.FOLLOWING,
        userId,
      );
    } else if (data.action === 'REMOVE') {
      await this.removeFollowing(userId, friendId);
      await this.removeFollowedBy(userId, friendId);
    } else {
      throw new HttpException('Invalid action', HttpStatus.BAD_REQUEST);
    }
    return 'Follow toggled successfully';
  }

  /**
   * It takes a token, decodes it, and returns the user's information
   * including private information of the user.
   * @param {string} token - The token that was sent to the client.
   * @returns RestrictedUserSelf - The user's information.
   */
  async getUser(token: string): Promise<RestrictedUserSelf> {
    const user = await decode(token, this.prisma);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      codeforcesUsername: user.codeforcesUsername,
      description: user.description,
      leetcodeUsername: user.leetcodeUsername,
      profilePicture: user.profilePicture,
      githubToken: user.githubToken,
    };
  }

  /**
   * It takes in a user id and a token, and returns a RestrictedUserOther object
   * @param {string} id - The id of the user you want to get
   * @param {string} token - The token of the user who is requesting the information.
   * @returns A RestrictedUserOther object
   */
  async getUserById(id: string, token: string): Promise<RestrictedUserOther> {
    const currentUser = await decode(token, this.prisma);
    const otherUser = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        codeforcesUsername: true,
        description: true,
        leetcodeUsername: true,
        profilePicture: true,
        githubToken: true,
      },
    });
    if (!otherUser) {
      throw new BadRequestException('User not found');
    }
    return {
      ...otherUser,
      isFollowing: currentUser.followingIds.includes(id),
    };
  }

  /**
   * It returns the followers of a user
   * @param {number} page - The page number of the followers list.
   * @param {string} userId - The id of the user whose followers we want to get.
   * @param {string} token - The token of the user who is requesting the followers.
   * @returns An array of RestrictedUserOther objects.
   */
  async getFollowers(
    page: number,
    userId: string,
    token: string,
  ): Promise<RestrictedUserOther[]> {
    const currentUser = await decode(token, this.prisma);
    if (!userId) {
      throw new BadRequestException('User not found');
    }
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new BadRequestException('Invalid user id');
    }
    const followers = await this.prisma.user.findMany({
      where: { following: { some: { id: userId } } },
      select: {
        id: true,
        name: true,
        email: true,
        codeforcesUsername: true,
        leetcodeUsername: true,
        description: true,
        profilePicture: true,
      },
      skip: (page - 1) * PAGINATION_LIMIT,
      take: PAGINATION_LIMIT,
    });
    const idSet = new Set(currentUser.followingIds);
    return followers.map((follower) => {
      return {
        ...follower,
        isFollowing: idSet.has(follower.id),
      };
    });
  }

  /**
   * It returns the list of users who are following the user with the given userId
   * @param {number} page - The page number of the list of users you want to get.
   * @param {string} userId - The id of the user whose followers you want to get.
   * @param {string} token - The token of the user who is requesting the data.
   * @returns An array of RestrictedUserOther objects
   */
  async getFollowing(
    page: number,
    userId: string,
    token: string,
  ): Promise<RestrictedUserOther[]> {
    await decode(token, this.prisma);
    if (!userId) {
      throw new BadRequestException('User not found');
    }
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new BadRequestException('Invalid user id');
    }
    const following = await this.prisma.user.findMany({
      where: {
        followedBy: { some: { id: userId } },
      },
      select: {
        id: true,
        name: true,
        email: true,
        codeforcesUsername: true,
        leetcodeUsername: true,
        description: true,
        profilePicture: true,
      },
      skip: (page - 1) * PAGINATION_LIMIT,
      take: PAGINATION_LIMIT,
    });
    const result: RestrictedUserOther[] = [];
    const followingSet = new Set(user.followingIds);
    for (const follow of following) {
      result.push({
        ...follow,
        isFollowing: followingSet.has(follow.id),
      });
    }
    return result;
  }

  async addDescription(description: string, token: string): Promise<string> {
    const user = await decode(token, this.prisma);
    const userId = user.id;
    await this.prisma.user.update({
      where: { id: userId },
      data: { description },
    });
    return 'Description added successfully';
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

  /**
   * It takes in a userId and a toFollowId, and then it updates the user
   * with the userId such that it follows the user with the toFollowId.
   * @param {string} userId - The id of the user who is following
   * @param {string} toFollowId - The id of the user you want to follow
   * @returns The updated user object.
   */
  async addFollowing(userId: string, toFollowId: string) {
    try {
      return await this.prisma.user.update({
        where: { id: userId },
        data: {
          following: {
            connect: {
              id: toFollowId,
            },
          },
        },
      });
    } catch {
      throw new HttpException('Invalid user id', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Connect the user with the id of userId to the followedBy field of the user with the id of
   * toFollowId such that the user with the id of toFollowId is now followed by the user with the id of userId.
   * @param {string} userId - The id of the user who is following
   * @param {string} toFollowId - The id of the user that is being followed
   */
  async addFollowedBy(userId: string, toFollowId: string) {
    try {
      await this.prisma.user.update({
        where: { id: toFollowId },
        data: {
          followedBy: {
            connect: {
              id: userId,
            },
          },
        },
      });
    } catch {
      throw new HttpException('Invalid user id', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * It takes in a userId and a friendId, and then it updates the user with the userId to
   * disconnect the friend with the friendId from the user's following list
   * This means that the user with the userId will no longer follow the user with the friendId.
   * @param {string} userId - The id of the user who is following
   * @param {string} friendId - The id of the user you want to unfollow.
   * @returns The user object with the updated following array.
   */
  async removeFollowing(userId: string, friendId: string) {
    try {
      return await this.prisma.user.update({
        where: { id: userId },
        data: {
          following: {
            disconnect: {
              id: friendId,
            },
          },
        },
      });
    } catch {
      throw new HttpException('Invalid user id', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Remove the user with the given userId from the followedBy array of the user with the given
   * friendId. This means that the user with the friendId will no longer be followed by the user with the userId.
   * @param {string} userId - The id of the user who is following the friend
   * @param {string} friendId - The id of the user that is being followed
   */
  async removeFollowedBy(userId: string, friendId: string) {
    try {
      await this.prisma.user.update({
        where: { id: friendId },
        data: {
          followedBy: {
            disconnect: {
              id: userId,
            },
          },
        },
      });
    } catch {
      throw new HttpException('Invalid user id', HttpStatus.BAD_REQUEST);
    }
  }
}
