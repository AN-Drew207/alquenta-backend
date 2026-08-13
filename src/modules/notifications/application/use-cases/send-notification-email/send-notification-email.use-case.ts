import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../../shared/application/use-case.interface';
import { UserRepository } from '../../../../auth/domain/repositories/user.repository';
import { Notification } from '../../../domain/entities/notification.entity';
import { EmailSender } from '../../../../../shared/domain/ports/email-sender';

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
      subject: 'Nuevo mensaje sobre tu propiedad',
      html: `<p>${notification.text}</p>`,
    });
  }
}
