import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CheckCodeInput,
  ForgotPasswordInput,
  ResetPasswordInput,
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

  /**
   * It creates a new user if the email doesn't exist, or updates the existing user if the email exists
   * but the account is not verified yet and sends a confirmation email to the user
   * @param {SignupInput} data - SignupInput
   * @returns A string
   */
  async signup(data: SignupInput) {
    data.email = data.email.toLowerCase();
    if (!this.isValidEmail(data.email)) {
      throw new BadRequestException('Invalid email address');
    }
    if (!this.isValidPassword(data.password)) {
      throw new BadRequestException(
        'Password must be at least 6 characters with atleast one uppercase letter, one lowercase letter and one number',
      );
    }
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
    return 'Account created successfully, please check your email to verify your account';
  }

  /**
   * Checks if the email is valid, checks if the user exists,
   * checks if the user is verified, checks if the password is valid, and if all of those checks pass,
   * it returns the user and a JWT token
   * @param {SigninInput} data - SigninInput
   * @returns The user and the token
   */
  async signin(data: SigninInput) {
    data.email = data.email.toLowerCase();
    if (!this.isValidEmail(data.email)) {
      throw new BadRequestException('Invalid email address');
    }
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (user === null) {
      throw new NotFoundException('User with the given email does not exist');
    }
    if (!user.isVerified) {
      throw new BadRequestException('Please verify your account first');
    }
    const isPasswordValid = bcrypt.compareSync(data.password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Incorrect Password');
    }
    const token = jwt.sign({ user: user.id }, SECRET_KEY);
    return { user, token };
  }

  /**
   * It checks the code sent by the user against the code stored in the database. If the code is
   * correct, it deletes the token from the database and updates the user's isVerified field to true
   * @param {CheckCodeInput} data - CheckCodeInput
   * @returns The user and the token
   */
  async checkCode(data: CheckCodeInput) {
    await this.cleanTokens();
    if (!this.isValidEmail(data.email)) {
      throw new BadRequestException('Invalid email address');
    }
    const token = await this.prisma.token.findUnique({
      where: { email: data.email },
    });
    if (token === null) {
      throw new NotFoundException('Token does not exist');
    }
    if (token.code !== data.code) {
      throw new BadRequestException('Incorrect Code');
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

  /**
   * It takes an email address, checks if it's valid, checks if the user exists, creates a code, saves
   * the code to the database, and sends an email to the user with the code
   * @param {ForgotPasswordInput} data - ForgotPasswordInput
   * @returns A string
   */
  async forgotPassword(data: ForgotPasswordInput) {
    if (!this.isValidEmail(data.email)) {
      throw new BadRequestException('Invalid email address');
    }
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (user === null) {
      throw new NotFoundException('User with the given email does not exist');
    }
    await this.prisma.token.deleteMany({
      where: { email: data.email },
    });
    const code = this.createCode();
    await this.prisma.token.create({
      data: {
        email: user.email,
        code,
      },
    });
    this.mailService.sendPasswordReset(user, code);
    return 'Password reset email has been sent successfully';
  }

  /**
   * It resets the password of a user using the code sent by the user and the code stored in the database
   * @param {ResetPasswordInput} data - ResetPasswordInput
   * @returns A string
   */
  async resetPassword(data: ResetPasswordInput) {
    await this.cleanTokens();
    if (!this.isValidEmail(data.email)) {
      throw new BadRequestException('Invalid email address');
    }
    if (!this.isValidPassword(data.password)) {
      throw new BadRequestException(
        'Password must be at least 6 characters with atleast one uppercase letter, one lowercase letter and one number',
      );
    }
    if (data.password !== data.confirmPassword) {
      throw new BadRequestException(
        'Password and Confirm Password must be the same',
      );
    }
    const token = await this.prisma.token.findUnique({
      where: { email: data.email },
    });
    if (token === null) {
      throw new NotFoundException('Token does not exist');
    }
    if (token.code !== data.code) {
      throw new BadRequestException('Incorrect Code');
    }
    await this.prisma.token.deleteMany({
      where: { email: data.email },
    });
    const hashedPassword = bcrypt.hashSync(data.password, 10);
    await this.prisma.user.update({
      where: { email: data.email },
      data: { password: hashedPassword },
    });
    return 'Password has been reset successfully';
  }

  /**
   * It deletes all tokens that are older than 10 minutes
   */
  async cleanTokens() {
    await this.prisma.token.deleteMany({
      where: {
        createdAt: { lte: new Date(Date.now() - 10 * 60 * 1000) },
      },
    });
  }

  /**
   * It creates a new token in the database, and then sends an email to the user with the token
   * @param {User} user - User - the user object that we want to send the email to
   */
  async sendUserConfirmationEmail(user: User) {
    await this.cleanTokens();
    const code = this.createCode();
    await this.prisma.token.create({
      data: {
        email: user.email,
        code,
      },
    });
    this.mailService.sendUserConfirmation(user, code);
  }

  /**
   * It creates a random code string of 6 characters
   * @returns The code
   */
  createCode() {
    let code = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for (let i = 0; i < 6; i++)
      code += possible.charAt(Math.floor(Math.random() * possible.length));
    return code;
  }

  /**
   * The function takes a string as an argument and checks if it's a valid email address
   * @param {string} email - The email address to validate.
   * @returns true if the email address is valid and false if it's not
   */
  isValidEmail(email: string) {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  }

  /**
   * The function returns true if the password contains at least one number, one lowercase letter, one
   * uppercase letter, and is at least six characters long
   * @param {string} password - The password to validate.
   * @returns true if the password is valid and false if it's not
   */
  isValidPassword(password: string) {
    const re = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
    return re.test(password);
  }
}
