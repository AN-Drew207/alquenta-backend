import { TransactionContext } from '../../../../shared/domain/transaction/transaction-context';
import { Notification } from '../entities/notification.entity';

export abstract class NotificationRepository {
  abstract save(
    notification: Notification,
    ctx?: TransactionContext,
  ): Promise<void>;
  abstract findById(id: string): Promise<Notification | null>;
  abstract findManyByRecipient(recipientUserId: string): Promise<Notification[]>;
}
