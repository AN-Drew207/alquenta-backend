import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../../shared/application/use-case.interface';
import { UserRepository } from '../../../../auth/domain/repositories/user.repository';
import { Notification } from '../../../domain/entities/notification.entity';
import { NotificationType } from '../../../domain/enums/notification-type.enum';
import { EmailSender } from '../../../../../shared/domain/ports/email-sender';

/**
 * Per-type email subjects — Spanish text, matching the rest of this
 * module's existing hardcoded-Spanish notification copy (a known, accepted
 * inconsistency vs. the otherwise English-only codebase, not something to
 * "fix" here). Keyed on the full NotificationType enum so adding a new
 * type without an entry here is a compile error, not a silent fallback.
 */
const NOTIFICATION_EMAIL_SUBJECTS: Record<NotificationType, string> = {
  [NotificationType.NEW_MESSAGE]: 'Nuevo mensaje sobre tu propiedad',
  [NotificationType.ANALYTICS_ALERT]:
    'Alerta: tu propiedad no ha recibido contactos recientemente',
};

@Injectable()
export class SendNotificationEmailUseCase implements UseCase<
  Notification,
  void
> {
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
      subject: NOTIFICATION_EMAIL_SUBJECTS[notification.type],
      html: `<p>${notification.text}</p>`,
    });
  }
}
