import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../../shared/application/use-case.interface';
import { Notification } from '../../../domain/entities/notification.entity';
import { NotificationRepository } from '../../../domain/repositories/notification.repository';

@Injectable()
export class ListMyNotificationsUseCase implements UseCase<
  string,
  Notification[]
> {
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(recipientUserId: string): Promise<Notification[]> {
    return this.notificationRepository.findManyByRecipient(recipientUserId);
  }
}
