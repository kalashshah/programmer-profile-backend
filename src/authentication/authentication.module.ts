import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AuthenticationResolver } from './authentication.resolver';
import { PrismaService } from '../../prisma/prisma.service';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [MailModule],
  providers: [PrismaService, AuthenticationResolver, AuthenticationService],
})
export class AuthenticationModule {}
