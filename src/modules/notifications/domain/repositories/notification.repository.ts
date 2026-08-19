import { TransactionContext } from '../../../../shared/domain/transaction/transaction-context';
import { Notification } from '../entities/notification.entity';
import { NotificationType } from '../enums/notification-type.enum';

export abstract class NotificationRepository {
  abstract save(
    notification: Notification,
    ctx?: TransactionContext,
  ): Promise<void>;
  abstract findById(id: string): Promise<Notification | null>;
  abstract findManyByRecipient(
    recipientUserId: string,
  ): Promise<Notification[]>;
  /**
   * Dedup check for CheckNoContactsAlertsUseCase: whether a notification of
   * the given type already exists for this property, created at or after
   * `since`. Used instead of a unique constraint because the same
   * (propertyId, type) pair is legitimately allowed to repeat over time —
   * just not within the same 14-day alert window.
   */
  abstract existsRecentByPropertyAndType(
    propertyId: string,
    type: NotificationType,
    since: Date,
  ): Promise<boolean>;
}
