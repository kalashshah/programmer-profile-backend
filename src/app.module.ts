import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core';
import { AuthenticationModule } from './authentication/authentication.module';
import { ApolloDriverConfig, ApolloDriver } from '@nestjs/apollo';
import { MailModule } from './mail/mail.module';
import { ConfigModule } from '@nestjs/config';
import { ProfileService } from './profile/profile.service';
import { ProfileModule } from './profile/profile.module';
import { PrismaService } from 'prisma/prisma.service';
import { DashboardService } from './dashboard/dashboard.service';
import { DashboardModule } from './dashboard/dashboard.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { CloudinaryService } from './cloudinary/cloudinary.service';
import { NotificationModule } from './notification/notification.module';
import { NotificationService } from './notification/notification.service';
import { ContestModule } from './contest/contest.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
      typePaths: ['./**/*.graphql'],
      driver: ApolloDriver,
      installSubscriptionHandlers: false,
    }),
    ConfigModule.forRoot(),
    AuthenticationModule,
    MailModule,
    ProfileModule,
    DashboardModule,
    CloudinaryModule,
    NotificationModule,
    ContestModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    ProfileService,
    PrismaService,
    DashboardService,
    CloudinaryService,
    NotificationService,
  ],
})
export class AppModule {}
