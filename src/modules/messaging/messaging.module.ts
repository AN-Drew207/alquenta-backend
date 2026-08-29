import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PropertiesModule } from '../properties/properties.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { ConversationRepository } from './domain/repositories/conversation.repository';
import { MessageRepository } from './domain/repositories/message.repository';
import { PrismaConversationRepository } from './infrastructure/persistence/prisma-conversation.repository';
import { PrismaMessageRepository } from './infrastructure/persistence/prisma-message.repository';
import { StartConversationUseCase } from './application/use-cases/start-conversation/start-conversation.use-case';
import { ReplyToConversationUseCase } from './application/use-cases/reply-to-conversation/reply-to-conversation.use-case';
import { ListMyConversationsUseCase } from './application/use-cases/list-my-conversations/list-my-conversations.use-case';
import { ListConversationMessagesUseCase } from './application/use-cases/list-conversation-messages/list-conversation-messages.use-case';
import { GetAdminResponseStatsUseCase } from './application/use-cases/get-admin-response-stats/get-admin-response-stats.use-case';
import { ConversationsController } from './presentation/http/conversations.controller';

@Module({
  imports: [AuthModule, PropertiesModule, NotificationsModule, AnalyticsModule],
  controllers: [ConversationsController],
  providers: [
    { provide: ConversationRepository, useClass: PrismaConversationRepository },
    { provide: MessageRepository, useClass: PrismaMessageRepository },
    StartConversationUseCase,
    ReplyToConversationUseCase,
    ListMyConversationsUseCase,
    ListConversationMessagesUseCase,
    GetAdminResponseStatsUseCase,
  ],
  exports: [ConversationRepository, MessageRepository],
})
export class MessagingModule {}
