import { Injectable } from '@nestjs/common';
import axios from 'axios';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GITHUB_SECRET_KEY,
} from './constants/env';
import { PrismaService } from 'prisma/prisma.service';
import { CloudinaryService } from './cloudinary/cloudinary.service';
import { GithubCallbackQuery } from './constants/profile.types';
import * as jwt from 'jsonwebtoken';
import { decode } from './constants/decode';

@Injectable()
export class AppService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  /**
   * It takes a query object as input, verifies the state and code, and then uses the code to get an
   * access token from Github
   * @param {GithubCallbackQuery} query - GithubCallbackQuery
   * @returns A string
   */
  async githubCallback(query: GithubCallbackQuery): Promise<string> {
    const { code, state } = query;
    if (!code || !state) {
      throw new BadRequestException('Invalid request');
    }
    const { userId } = jwt.verify(state, GITHUB_SECRET_KEY) as {
      userId: string;
      iat: number;
    };
    if (!userId) {
      throw new BadRequestException('Invalid state');
    }
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    if (!user.isVerified) {
      throw new BadRequestException('User is not verified');
    }
    const githubAuth = await this.prisma.githubAuth.findUnique({
      where: { userId },
    });
    if (!githubAuth) {
      throw new Error(
        'Github auth codes are valid only for 10 minutes, please try again',
      );
    }
    if (githubAuth.state !== state) {
      throw new Error('Invalid state');
    }
    try {
      const response: any = await axios.post(
        `https://github.com/login/oauth/access_token?client_id=${GITHUB_CLIENT_ID}&client_secret=${GITHUB_CLIENT_SECRET}&code=${code}`,
        { headers: { Accept: 'application/vnd.github+json' } },
      );
      let access_token = '';
      let i = 0;
      while (true) if (response.data[i++] === '=') break;
      for (; i < response.data.length; i++) {
        if (response.data[i] === '&') break;
        access_token += response.data[i];
      }
      await this.prisma.githubAuth.deleteMany({
        where: { id: userId },
      });
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          githubToken: access_token,
        },
      });
      return 'Github account linked successfully';
    } catch (error) {
      throw new Error('Github code is either invalid or expired');
    }
  }

  /**
   * It uploads a profile picture to Cloudinary, deletes the old profile picture from Cloudinary, and
   * updates the user's profile picture in the database
   * @param file - Express.Multer.File - This is the file that was uploaded by the user.
   * @param {string} token - The token that was sent to the client when they logged in.
   * @returns The secure_url of the uploaded image
   */
  async uploadProfilePicture(
    file: Express.Multer.File,
    token: string,
  ): Promise<string> {
    try {
      const user = await decode(token, this.prisma);
      const upload = await this.cloudinary.uploadImage(file);
      if (user.profilePicturePublicId) {
        await this.cloudinary.deleteImage(user.profilePicturePublicId);
      }
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          profilePicture: upload.secure_url,
          profilePicturePublicId: upload.public_id,
        },
      });
      return upload.secure_url;
    } catch (error) {
      throw new InternalServerErrorException(
        error.message || 'Internal error, could not upload profile picture',
      );
    }
  }
}
