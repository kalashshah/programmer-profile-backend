import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from '../graphql.types';
import { EMAIL } from '../constants/env';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserConfirmation(user: User, code: string) {
    await this.mailerService.sendMail({
      to: user.email,
      from: `"No Reply" <${EMAIL}>`,
      subject: 'Welcome to your Programmer Profile! Please confirm your Email',
      template: './email_confirmation',
      context: {
        name: user.name,
        code,
      },
    });
  }
}
