import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { decode } from 'src/constants/decode';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async sendNotification(
    userId: string,
    description: string,
    type: 'FOLLOWING',
  ) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        notifications: {
          create: {
            description,
            notificationType: type,
          },
        },
      },
    });
  }

  async seeNotification(notificationId: string, token: string) {
    await decode(token, this.prisma);
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
  }

  async seeNotifications(notificationIds: string[], token: string) {
    await decode(token, this.prisma);
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
  }

  async notifications(token: string) {
    const user = await decode(token, this.prisma);
    const notifs = await this.prisma.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        notifications: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
    const unseenNotifs = await this.prisma.user.count({
      where: {
        id: user.id,
        notifications: {
          some: {
            seenStatus: false,
          },
        },
      },
    });
    return {
      notifications: notifs?.notifications,
      unseenNotifications: unseenNotifs,
    };
  }

  /**
   * Delete all notifications that were seen 48 hours ago
   */
  async deleteSeenPreviousNotifications() {
    await this.prisma.notification.deleteMany({
      where: {
        seenStatus: true,
        seenAt: {
          lt: new Date(new Date().getTime() - 48 * 60 * 60 * 1000),
        },
      },
    });
  }
}
