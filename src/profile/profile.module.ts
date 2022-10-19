import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileResolver } from './profile.resolver';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  providers: [PrismaService, ProfileResolver, ProfileService],
})
export class ProfileModule {}
