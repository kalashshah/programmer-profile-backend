import { Injectable } from '@nestjs/common';
import { NotificationType } from 'src/graphql.types';
import { PrismaService } from 'prisma/prisma.service';
import { decode } from 'src/constants/decode';
import { NotificationOutput } from 'src/graphql.types';
import { HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async sendNotification(
    toUser: string,
    description: string,
    type: NotificationType,
    fromUser?: string,
  ): Promise<void> {
    try {
      await this.prisma.notification.deleteMany({
        where: {
          userId: toUser,
          notificationType: type,
          otherUserId: fromUser,
        },
      });
    } catch {
      throw new HttpException(
        'Error occurred while deleting previous notifications',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    try {
      await this.prisma.notification.create({
        data: {
          description,
          notificationType: type,
          User: {
            connect: {
              id: toUser,
            },
          },
          OtherUser: {
            connect: {
              id: fromUser,
            },
          },
        },
      });
    } catch {
      throw new HttpException(
        'Error occurred while sending notification',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async seeNotification(notificationId: string, token: string) {
    await decode(token, this.prisma);
    try {
      const notification = await this.prisma.notification.update({
        where: {
          id: notificationId,
        },
        data: {
          seenStatus: true,
          seenAt: new Date(),
        },
      });
      return notification;
    } catch {
      throw new HttpException(
        'Error occurred while marking notification as seen',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async seeNotifications(notificationIds: string[], token: string) {
    await decode(token, this.prisma);
    try {
      const notifications = await this.prisma.notification.updateMany({
        where: {
          id: {
            in: notificationIds,
          },
        },
        data: {
          seenStatus: true,
          seenAt: new Date(),
        },
      });
      return notifications;
    } catch {
      throw new HttpException(
        'Error occurred while marking notifications as seen',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async notifications(token: string): Promise<NotificationOutput> {
    const user = await decode(token, this.prisma);
    this.deleteSeenPreviousNotifications();
    try {
      const notifs = await this.prisma.user.findUnique({
        where: {
          id: user.id,
        },
        select: {
          notifications: {
            orderBy: {
              createdAt: 'desc',
            },
            select: {
              id: true,
              description: true,
              notificationType: true,
              seenStatus: true,
              createdAt: true,
              OtherUser: {
                select: {
                  id: true,
                  name: true,
                  profilePicture: true,
                },
              },
              User: {
                select: {
                  id: true,
                  name: true,
                  profilePicture: true,
                },
              },
            },
          },
        },
      });
      let unseenNotifications = 0;
      for (const notif of notifs?.notifications) {
        if (notif.seenStatus === false) unseenNotifications++;
      }
      return {
        unseenNotifications: unseenNotifications,
        notifications:
          notifs?.notifications as NotificationOutput['notifications'],
      };
    } catch {
      throw new HttpException(
        'Error occurred while fetching notifications',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteSeenPreviousNotifications() {
    try {
      await this.prisma.notification.deleteMany({
        where: {
          seenStatus: true,
          seenAt: {
            lt: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
          },
        },
      });
    } catch (err) {
      throw new HttpException(
        'Error occurred while deleting previous notifications',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
