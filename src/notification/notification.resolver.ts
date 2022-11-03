import { Mutation, Resolver, Context, Args, Query } from '@nestjs/graphql';
import { getToken } from 'src/constants/decode';
import { SeeNotificationInput, SeeNotificationsInput } from 'src/graphql.types';
import { NotificationService } from './notification.service';

@Resolver()
export class NotificationResolver {
  constructor(private readonly notificationService: NotificationService) {}

  @Mutation('seeNotification')
  async seenNotification(
    @Args('input') input: SeeNotificationInput,
    @Context() context,
  ) {
    const token = getToken(context);
    await this.notificationService.seeNotification(input.notificationId, token);
    return 'Notification seen';
  }

  @Mutation('seeNotifications')
  async seeNotifications(
    @Args('input') input: SeeNotificationsInput,
    @Context() context,
  ) {
    const token = getToken(context);
    await this.notificationService.seeNotifications(
      input.notificationIds,
      token,
    );
    return 'Notifications seen';
  }

  @Query('notifications')
  async notifications(@Context() context) {
    const token = getToken(context);
    const notifications = await this.notificationService.notifications(token);
    console.log(notifications);
    return notifications;
  }
}
