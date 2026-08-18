import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../../shared/application/use-case.interface';
import { EntityNotFoundException } from '../../../../../shared/domain/exceptions/entity-not-found.exception';
import { Message } from '../../../domain/entities/message.entity';
import { ConversationRepository } from '../../../domain/repositories/conversation.repository';
import { MessageRepository } from '../../../domain/repositories/message.repository';
import { NotConversationParticipantException } from '../../../domain/exceptions/not-conversation-participant.exception';
import { ListConversationMessagesQuery } from './list-conversation-messages.query';

@Injectable()
export class ListConversationMessagesUseCase implements UseCase<
  ListConversationMessagesQuery,
  Message[]
> {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly messageRepository: MessageRepository,
  ) {}

  async execute(query: ListConversationMessagesQuery): Promise<Message[]> {
    const conversation = await this.conversationRepository.findById(
      query.conversationId,
    );
    if (!conversation) {
      throw new EntityNotFoundException('Conversation', query.conversationId);
    }
    if (!conversation.hasParticipant(query.requesterId)) {
      throw new NotConversationParticipantException(query.conversationId);
    }

    await this.messageRepository.markAsReadExcludingAuthor(
      query.conversationId,
      query.requesterId,
    );

    return this.messageRepository.findManyByConversation(query.conversationId);
  }
}
