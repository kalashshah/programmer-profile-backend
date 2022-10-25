import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationResolver } from './notification.resolver';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  providers: [NotificationResolver, NotificationService, PrismaService],
})
export class NotificationModule {}
