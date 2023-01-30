import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from '../graphql.types';
import { EMAIL } from '../constants/env';
import { HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  /**
   * It sends an email to the user's email address with a 6-digit code
   * @param {User} user - User - The user object that we want to send the email to.
   * @param {string} code - The 6-digit code that will be sent to the user's email.
   */
  async sendUserConfirmation(user: User, code: string) {
    try {
      await this.mailerService.sendMail({
        to: user.email,
        from: `"No Reply" <${EMAIL}>`,
        subject:
          'Welcome to your Programmer Profile! Please confirm your Email',
        template: './email_confirmation',
        context: {
          name: user.name,
          code,
          text: 'Your 6-digit Verification Code',
        },
      });
    } catch {
      throw new HttpException('Invalid Email', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * It sends an email to the user's email address with a 6-digit code to reset their password
   * @param {User} user - User - The user object that we want to send the email to.
   * @param {string} code - The 6-digit code that will be sent to the user's email.
   */
  async sendPasswordReset(user: User, code: string) {
    try {
      await this.mailerService.sendMail({
        to: user.email,
        from: `"No Reply" <${EMAIL}>`,
        subject: 'Reset your password',
        template: './email_confirmation',
        context: {
          name: user.name,
          code,
          text: 'Use this code to reset your password',
        },
      });
    } catch {
      throw new HttpException('Invalid Email', HttpStatus.BAD_REQUEST);
    }
  }
}
