import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileResolver } from './profile.resolver';
import { PrismaService } from 'prisma/prisma.service';
import { NotificationService } from 'src/notification/notification.service';

@Module({
  providers: [
    PrismaService,
    ProfileResolver,
    ProfileService,
    PrismaService,
    NotificationService,
  ],
})
export class ProfileModule {}
