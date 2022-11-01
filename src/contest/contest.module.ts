import { Module } from '@nestjs/common';
import { ContestService } from './contest.service';
import { ContestResolver } from './contest.resolver';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  providers: [PrismaService, ContestResolver, ContestService],
})
export class ContestModule {}
