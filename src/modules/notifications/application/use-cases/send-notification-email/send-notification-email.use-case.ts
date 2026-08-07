import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../../shared/application/use-case.interface';
import { UserRepository } from '../../../../auth/domain/repositories/user.repository';
import { Notification } from '../../../domain/entities/notification.entity';
import { NotificationType } from '../../../domain/enums/notification-type.enum';
import { EmailSender } from '../../../domain/ports/email-sender';

@Injectable()
export class SendNotificationEmailUseCase
  implements UseCase<Notification, void>
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailSender: EmailSender,
  ) {}

  async execute(notification: Notification): Promise<void> {
    const user = await this.userRepository.findById(
      notification.recipientUserId,
    );
    if (!user) {
      return;
    }

    await this.emailSender.send({
      to: user.email,
      subject: this.subjectFor(notification.type),
      html: `<p>${notification.text}</p>`,
    });
  }

  private subjectFor(type: NotificationType): string {
    switch (type) {
      case NotificationType.NEW_MESSAGE:
        return 'New message on your property listing';
      case NotificationType.NEW_OFFER:
        return 'New offer on your property listing';
    }
  }
}
