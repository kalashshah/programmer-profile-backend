import { Injectable } from '@nestjs/common';
import { NotificationType } from 'src/graphql.types';
import { PrismaService } from 'prisma/prisma.service';
import { decode } from 'src/constants/decode';
import { NotificationOutput } from 'src/graphql.types';
import { HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  /**
   * It deletes all previous notifications of the same type from the same user, then creates a new
   * notification
   * @param {string} toUser - The user who will receive the notification
   * @param {string} description - The description of the notification
   * @param {NotificationType} type - NotificationType
   * @param {string} [fromUser] - The user who sent the notification
   */
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

  /**
   * It takes a notificationId and a token as arguments, decodes the token, and then updates the
   * notification with the given notificationId to have a seenStatus of true and a seenAt date of the
   * current date
   * @param {string} notificationId - The id of the notification to be marked as seen
   * @param {string} token - The token that was sent to the user's email address.
   * @returns The notification that was updated.
   */
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

  /**
   * It takes an array of notification ids and a token as arguments, decodes the token, and then
   * updates the notifications with the given ids to have a seen status of true and a seenAt date of
   * the current date
   * @param {string[]} notificationIds - The ids of the notifications to be marked as seen
   * @param {string} token - The token of the user who is trying to mark the notifications as seen.
   * @returns The notifications that were updated
   */
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

  /**
   * It fetches all the notifications of a user and returns the unseen notifications count and the
   * notifications themselves
   * @param {string} token - The token of the user who is requesting the notifications
   * @returns The notifications of the user.
   */
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
                  description: true,
                },
              },
              User: {
                select: {
                  id: true,
                  name: true,
                  profilePicture: true,
                  description: true,
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

  /**
   * It deletes all notifications that are older than 24 hours and have been seen by the user
   */
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
