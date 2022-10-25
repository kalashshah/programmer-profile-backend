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
import { GithubCallbackQuery } from './constants/profile.types';
import * as jwt from 'jsonwebtoken';
import { decode } from './constants/decode';
import { CloudinaryService } from './cloudinary/cloudinary.service';

@Injectable()
export class AppService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  getHello(): string {
    return 'Hello from B-704';
  }
  getHello2(): string {
    return '8 CPI Boi - Akhilesh Manda';
  }

  async githubCallback(query: GithubCallbackQuery): Promise<string> {
    const { code, state } = query;
    if (!code || !state) {
      throw new BadRequestException('Invalid request');
    }
    const { userId } = jwt.verify(state, GITHUB_SECRET_KEY) as {
      userId: string;
      iat: number;
    };
    console.log('userId', userId);
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
      console.log(
        `https://github.com/login/oauth/access_token?client_id=${GITHUB_CLIENT_ID}&client_secret=${GITHUB_CLIENT_SECRET}&code=${code}`,
      );
      console.log('data', response.data);
      console.log('access_token', response.data.access_token);
      console.log('type', typeof response.data);
      let access_token = '';
      let i = 0;
      while (true) if (response.data[i++] === '=') break;
      for (; i < response.data.length; i++) {
        if (response.data[i] === '&') break;
        access_token += response.data[i];
      }
      console.log(response.data);
      await this.prisma.githubAuth.deleteMany({
        where: { id: userId },
      });
      console.log('access_token', access_token);
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

  async uploadProfilePicture(
    file: Express.Multer.File,
    token: string,
  ): Promise<string> {
    console.log(file);
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
