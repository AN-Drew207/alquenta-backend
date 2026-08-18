import { DomainForbiddenException } from '../../../../shared/domain/exceptions/domain-forbidden.exception';

export class NotificationNotOwnedByUserException extends DomainForbiddenException {
  constructor(notificationId: string) {
    super(
      `Notification "${notificationId}" does not belong to the authenticated user`,
    );
  }
}
