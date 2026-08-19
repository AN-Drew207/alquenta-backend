import { Notification } from '../../../domain/entities/notification.entity';
import { NotificationResponseDto } from '../dto/notification-response.dto';

export class NotificationResponseMapper {
  static toDto(notification: Notification): NotificationResponseDto {
    return {
      id: notification.id,
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
