import { NotificationType } from '../../../domain/enums/notification-type.enum';

export class CreateNotificationCommand {
  constructor(
    readonly recipientUserId: string,
    readonly type: NotificationType,
    readonly text: string,
    readonly messageId?: string,
    readonly conversationId?: string,
    readonly propertyId?: string,
  ) {}
}
