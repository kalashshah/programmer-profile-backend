import { PrismaService } from 'prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { SECRET_KEY } from './env';

/**
 * It takes a token and a prisma service as arguments, decodes the token, finds the user in the
 * database, and returns the user
 * @param {string} token - string - the token to decode
 * @param {PrismaService} prisma - PrismaService - the prisma service
 * @returns The user object
 */
export const decode = async (token: string, prisma: PrismaService) => {
  const decoded = jwt.verify(token, SECRET_KEY) as jwt.JwtPayload;
  const userId = decoded?.user;
  if (!userId) throw new Error('Invalid authorization token');
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) throw new BadRequestException('Invalid authorization token');
  if (!user.isVerified) throw new BadRequestException('User not verified');
  return user;
};
