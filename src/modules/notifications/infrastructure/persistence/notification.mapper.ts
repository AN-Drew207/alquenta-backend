import {
  Prisma,
  Notification as PrismaNotification,
} from '../../../../../generated/prisma/client';
import { Notification } from '../../domain/entities/notification.entity';
import { NotificationType } from '../../domain/enums/notification-type.enum';
import { NotificationStatus } from '../../domain/enums/notification-status.enum';

export class NotificationMapper {
  static toDomain(row: PrismaNotification): Notification {
    return Notification.reconstitute({
      id: row.id,
      recipientUserId: row.recipientUserId,
      type: row.type as NotificationType,
      messageId: row.messageId,
      conversationId: row.conversationId,
      propertyId: row.propertyId,
      text: row.text,
      status: row.status as NotificationStatus,
      createdAt: row.createdAt,
    });
  }

  static toPersistence(
    notification: Notification,
  ): Prisma.NotificationUncheckedCreateInput {
    return {
      id: notification.id,
      recipientUserId: notification.recipientUserId,
      type: notification.type,
      messageId: notification.messageId,
      conversationId: notification.conversationId,
      propertyId: notification.propertyId,
      text: notification.text,
      status: notification.status,
      createdAt: notification.createdAt,
    };
  }
}
