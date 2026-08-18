import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../../shared/application/use-case.interface';
import { Conversation } from '../../../domain/entities/conversation.entity';
import { ConversationRepository } from '../../../domain/repositories/conversation.repository';

@Injectable()
export class ListMyConversationsUseCase implements UseCase<
  string,
  Conversation[]
> {
  constructor(
    private readonly conversationRepository: ConversationRepository,
  ) {}

  async execute(userId: string): Promise<Conversation[]> {
    return this.conversationRepository.findManyByUser(userId);
  }
}
