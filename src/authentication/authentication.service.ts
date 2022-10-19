import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CheckCodeInput,
  SigninInput,
  SignupInput,
} from '../../src/graphql.types';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { MailService } from 'src/mail/mail.service';
import { User } from '../../src/graphql.types';
import { SECRET_KEY } from 'src/constants/env';

@Injectable()
export class AuthenticationService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async signup(data: SignupInput) {
    data.email = data.email.toLowerCase();
    if (data.password !== data.confirmPassword) {
      throw new BadRequestException(
        'Password and Confirm Password must be the same',
      );
    }
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser !== null && existingUser.isVerified) {
      throw new BadRequestException('User with the same email already exists');
    }
    await this.prisma.token.deleteMany({
      where: { email: data.email },
    });
    const hashedPassword = bcrypt.hashSync(data.password, 10);
    if (existingUser !== null && !existingUser.isVerified) {
      const updatedUser = await this.prisma.user.update({
        where: { email: data.email },
        data: {
          name: data.name,
          password: hashedPassword,
          isVerified: false,
        },
      });
      this.sendUserConfirmationEmail(updatedUser);
    }
    if (existingUser === null) {
      const newUser = await this.prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword,
          isVerified: false,
        },
      });
      this.sendUserConfirmationEmail(newUser);
    }
    return true;
  }

  async signin(data: SigninInput) {
    data.email = data.email.toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (user === null) {
      throw new NotFoundException('User with the given email does not exist');
    }
    const isPasswordValid = bcrypt.compareSync(data.password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Incorrect Password');
    }
    const token = jwt.sign({ user: user.id }, SECRET_KEY);
    return { user, token };
  }

  async sendUserConfirmationEmail(user: User) {
    await this.cleanTokens();
    let code = '';
    const possible =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 6; i++)
      code += possible.charAt(Math.floor(Math.random() * possible.length));
    await this.prisma.token.create({
      data: {
        email: user.email,
        code,
      },
    });
    this.mailService.sendUserConfirmation(user, code);
  }

  async checkCode(data: CheckCodeInput) {
    const token = await this.prisma.token.findUnique({
      where: { email: data.email },
    });
    if (token === null) {
      throw new NotFoundException('Token does not exist');
    }
    if (token.code !== data.code) {
      throw new BadRequestException('Incorrect Code');
    }
    if (token.createdAt.getTime() < Date.now() - 10 * 60 * 1000) {
      await this.prisma.token.delete({ where: { email: data.email } });
      throw new BadRequestException('Code has expired');
    }
    await this.prisma.token.deleteMany({
      where: { email: data.email },
    });
    await this.prisma.user.update({
      where: { email: data.email },
      data: { isVerified: true },
    });
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    const tkn = jwt.sign({ user: user.id }, SECRET_KEY);
    return { user, token: tkn };
  }

  async cleanTokens() {
    await this.prisma.token.deleteMany({
      where: {
        createdAt: { lte: new Date(Date.now() - 10 * 60 * 1000) },
      },
    });
  }
}
