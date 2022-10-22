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
  ],
  controllers: [AppController],
  providers: [AppService, ProfileService, PrismaService],
})
export class AppModule {}
