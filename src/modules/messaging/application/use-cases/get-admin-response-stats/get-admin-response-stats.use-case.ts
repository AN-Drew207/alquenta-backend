import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../../shared/application/use-case.interface';
import { ConversationRepository } from '../../../domain/repositories/conversation.repository';
import { MessageRepository } from '../../../domain/repositories/message.repository';
import { AdminResponseStats } from './admin-response-stats';
import { GetAdminResponseStatsQuery } from './get-admin-response-stats.query';

@Injectable()
export class GetAdminResponseStatsUseCase implements UseCase<
  GetAdminResponseStatsQuery,
  AdminResponseStats
> {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly messageRepository: MessageRepository,
  ) {}

  async execute(
    query: GetAdminResponseStatsQuery,
  ): Promise<AdminResponseStats> {
    const conversations = await this.conversationRepository.findManyByAdminId(
      query.adminId,
    );
    if (conversations.length === 0) {
      return new AdminResponseStats(0, null, 0);
    }

    let repliedCount = 0;
    const responseTimesMs: number[] = [];

    for (const conversation of conversations) {
      const messages = await this.messageRepository.findManyByConversation(
        conversation.id,
      );
      const firstClientMessage = messages.find(
        (message) => message.authorId === conversation.clientId,
      );
      const firstAdminReply = messages.find(
        (message) =>
          message.authorId === conversation.adminId &&
          (!firstClientMessage ||
            message.createdAt > firstClientMessage.createdAt),
      );

      if (firstAdminReply) {
        repliedCount += 1;
        if (firstClientMessage) {
          responseTimesMs.push(
            firstAdminReply.createdAt.getTime() -
              firstClientMessage.createdAt.getTime(),
          );
        }
      }
    }

    const averageResponseMinutes =
      responseTimesMs.length > 0
        ? responseTimesMs.reduce((sum, ms) => sum + ms, 0) /
          responseTimesMs.length /
          60_000
        : null;

    return new AdminResponseStats(
      repliedCount / conversations.length,
      averageResponseMinutes,
      conversations.length,
    );
  }
}
