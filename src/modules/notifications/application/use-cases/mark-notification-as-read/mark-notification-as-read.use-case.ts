import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../../shared/application/use-case.interface';
import { EntityNotFoundException } from '../../../../../shared/domain/exceptions/entity-not-found.exception';
import { Notification } from '../../../domain/entities/notification.entity';
import { NotificationRepository } from '../../../domain/repositories/notification.repository';
import { NotificationNotOwnedByUserException } from '../../../domain/exceptions/notification-not-owned-by-user.exception';
import { MarkNotificationAsReadCommand } from './mark-notification-as-read.command';

@Injectable()
export class MarkNotificationAsReadUseCase
  implements UseCase<MarkNotificationAsReadCommand, Notification>
{
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(command: MarkNotificationAsReadCommand): Promise<Notification> {
    const notification = await this.notificationRepository.findById(
      command.notificationId,
    );
    if (!notification) {
      throw new EntityNotFoundException('Notification', command.notificationId);
    }
    if (!notification.belongsTo(command.userId)) {
      throw new NotificationNotOwnedByUserException(command.notificationId);
    }

    notification.markAsRead();
    await this.notificationRepository.save(notification);
    return notification;
  }
}
