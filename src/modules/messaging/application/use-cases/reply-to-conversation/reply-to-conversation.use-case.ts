import { Injectable, Logger } from '@nestjs/common';
import { UseCase } from '../../../../../shared/application/use-case.interface';
import { UnitOfWork } from '../../../../../shared/domain/transaction/unit-of-work';
import { EntityNotFoundException } from '../../../../../shared/domain/exceptions/entity-not-found.exception';
import { NotificationRepository } from '../../../../notifications/domain/repositories/notification.repository';
import { Notification } from '../../../../notifications/domain/entities/notification.entity';
import { NotificationType } from '../../../../notifications/domain/enums/notification-type.enum';
import { SendNotificationEmailUseCase } from '../../../../notifications/application/use-cases/send-notification-email/send-notification-email.use-case';
import { Message } from '../../../domain/entities/message.entity';
import { ConversationRepository } from '../../../domain/repositories/conversation.repository';
import { MessageRepository } from '../../../domain/repositories/message.repository';
import { NotConversationParticipantException } from '../../../domain/exceptions/not-conversation-participant.exception';
import { ReplyToConversationCommand } from './reply-to-conversation.command';

@Injectable()
export class ReplyToConversationUseCase
  implements UseCase<ReplyToConversationCommand, Message>
{
  private readonly logger = new Logger(ReplyToConversationUseCase.name);

  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly messageRepository: MessageRepository,
    private readonly notificationRepository: NotificationRepository,
    private readonly sendNotificationEmailUseCase: SendNotificationEmailUseCase,
    private readonly unitOfWork: UnitOfWork,
  ) {}

  async execute(command: ReplyToConversationCommand): Promise<Message> {
    const conversation = await this.conversationRepository.findById(
      command.conversationId,
    );
    if (!conversation) {
      throw new EntityNotFoundException('Conversation', command.conversationId);
    }
    if (!conversation.hasParticipant(command.authorId)) {
      throw new NotConversationParticipantException(command.conversationId);
    }

    const recipientUserId = conversation.otherParticipant(command.authorId);

    let notification: Notification;
    let message: Message;

    await this.unitOfWork.runInTransaction(async (ctx) => {
      message = Message.create({
        conversationId: conversation.id,
        authorId: command.authorId,
        content: command.content,
        offerAmount: command.offerAmount,
      });
      await this.messageRepository.save(message, ctx);

      notification = Notification.create({
        recipientUserId,
        type: command.offerAmount
          ? NotificationType.NEW_OFFER
          : NotificationType.NEW_MESSAGE,
        text: command.offerAmount
          ? `New offer of $${command.offerAmount} in your conversation`
          : 'New reply in your conversation',
        messageId: message.id,
      });
      await this.notificationRepository.save(notification, ctx);
    });

    try {
      await this.sendNotificationEmailUseCase.execute(notification!);
    } catch (error) {
      this.logger.error('Failed to send notification email', error as Error);
    }

    return message!;
  }
}
