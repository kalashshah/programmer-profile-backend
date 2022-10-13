import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SigninInput } from './dto/signin.input';
import { SignupInput } from './dto/signup.input';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.SECRET_KEY;

@Injectable()
export class AuthenticationService {
  constructor(private prisma: PrismaService) {}

  async signup(data: SignupInput) {
    if (data.password !== data.confirmPassword) {
      throw new BadRequestException(
        'Password and Confirm Password must be the same',
      );
    }
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser !== null) {
      throw new BadRequestException('User with the same email already exists');
    }
    const hashedPassword = bcrypt.hashSync(data.password, 10);
    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
      },
    });
    const token = jwt.sign({ user: user.id }, SECRET_KEY);
    return { user, token };
  }

  async signin(data: SigninInput) {
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
}
