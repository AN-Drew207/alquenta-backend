import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../../shared/application/use-case.interface';
import { Notification } from '../../../domain/entities/notification.entity';
import { NotificationRepository } from '../../../domain/repositories/notification.repository';
import { CreateNotificationCommand } from './create-notification.command';

@Injectable()
export class CreateNotificationUseCase
  implements UseCase<CreateNotificationCommand, Notification>
{
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(command: CreateNotificationCommand): Promise<Notification> {
    const notification = Notification.create({
      recipientUserId: command.recipientUserId,
      type: command.type,
      text: command.text,
      messageId: command.messageId,
    });

    await this.notificationRepository.save(notification);
    return notification;
  }
}
