import { Injectable, Logger } from '@nestjs/common';
import { UseCase } from '../../../../../shared/application/use-case.interface';
import { UnitOfWork } from '../../../../../shared/domain/transaction/unit-of-work';
import { EntityNotFoundException } from '../../../../../shared/domain/exceptions/entity-not-found.exception';
import { PropertyRepository } from '../../../../properties/domain/repositories/property.repository';
import { PropertyStatus } from '../../../../properties/domain/enums/property-status.enum';
import { UserRepository } from '../../../../auth/domain/repositories/user.repository';
import { NotificationRepository } from '../../../../notifications/domain/repositories/notification.repository';
import { Notification } from '../../../../notifications/domain/entities/notification.entity';
import { NotificationType } from '../../../../notifications/domain/enums/notification-type.enum';
import { SendNotificationEmailUseCase } from '../../../../notifications/application/use-cases/send-notification-email/send-notification-email.use-case';
import { Conversation } from '../../../domain/entities/conversation.entity';
import { Message } from '../../../domain/entities/message.entity';
import { ConversationRepository } from '../../../domain/repositories/conversation.repository';
import { MessageRepository } from '../../../domain/repositories/message.repository';
import { PropertyNotAvailableException } from '../../../domain/exceptions/property-not-available.exception';
import { StartConversationCommand } from './start-conversation.command';

export interface StartConversationResult {
  conversation: Conversation;
  message: Message;
}

@Injectable()
export class StartConversationUseCase
  implements UseCase<StartConversationCommand, StartConversationResult>
{
  private readonly logger = new Logger(StartConversationUseCase.name);

  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly messageRepository: MessageRepository,
    private readonly propertyRepository: PropertyRepository,
    private readonly userRepository: UserRepository,
    private readonly notificationRepository: NotificationRepository,
    private readonly sendNotificationEmailUseCase: SendNotificationEmailUseCase,
    private readonly unitOfWork: UnitOfWork,
  ) {}

  async execute(
    command: StartConversationCommand,
  ): Promise<StartConversationResult> {
    const property = await this.propertyRepository.findById(
      command.propertyId,
    );
    if (!property) {
      throw new EntityNotFoundException('Property', command.propertyId);
    }
    if (property.status !== PropertyStatus.AVAILABLE) {
      throw new PropertyNotAvailableException(command.propertyId);
    }

    const client = await this.userRepository.findById(command.clientId);
    const clientName = client?.name ?? 'Un cliente';

    const candidate = Conversation.create({
      propertyId: property.id,
      clientId: command.clientId,
      adminId: property.adminId,
    });

    let notification: Notification;
    let message: Message;
    let conversation: Conversation;

    await this.unitOfWork.runInTransaction(async (ctx) => {
      conversation = await this.conversationRepository.findOrCreate(
        candidate,
        ctx,
      );

      message = Message.create({
        conversationId: conversation.id,
        authorId: command.clientId,
        authorName: clientName,
        content: command.content,
      });
      await this.messageRepository.save(message, ctx);

      notification = Notification.create({
        recipientUserId: property.adminId,
        type: NotificationType.NEW_MESSAGE,
        text: `${clientName} te escribió sobre "${property.title}"`,
        messageId: message.id,
        conversationId: conversation.id,
      });
      await this.notificationRepository.save(notification, ctx);
    });

    try {
      await this.sendNotificationEmailUseCase.execute(notification!);
    } catch (error) {
      this.logger.error('Failed to send notification email', error as Error);
    }

    return { conversation: conversation!, message: message! };
  }
}
