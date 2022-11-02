import { PrismaService } from 'prisma/prisma.service';
import * as jwt from 'jsonwebtoken';
import { SECRET_KEY } from './env';
import { HttpException, HttpStatus } from '@nestjs/common';

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
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user)
    throw new HttpException(
      'Invalid authorization token',
      HttpStatus.BAD_REQUEST,
    );
  if (!user.isVerified)
    throw new HttpException('User not verified', HttpStatus.BAD_REQUEST);
  return user;
};

/**
 * It gets the token from the request header, and if it's not found, it throws an error.
 * @param {any} context - any - this is the context object that is passed to the resolver function.
 * @returns The token is being returned.
 */
export const getToken = (context: any) => {
  const authorization = context?.req?.headers?.authorization;
  const token = authorization?.split(' ')[1];
  if (token === undefined)
    throw new HttpException(
      'Invalid request, token not found',
      HttpStatus.BAD_REQUEST,
    );
  return token;
};
