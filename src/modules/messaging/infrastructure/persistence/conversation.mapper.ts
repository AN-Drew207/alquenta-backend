import {
  Prisma,
  Conversation as PrismaConversation,
} from '../../../../../generated/prisma/client';
import { Conversation } from '../../domain/entities/conversation.entity';

export class ConversationMapper {
  static toDomain(row: PrismaConversation): Conversation {
    return Conversation.reconstitute({
      id: row.id,
      propertyId: row.propertyId,
      clientId: row.clientId,
      adminId: row.adminId,
      createdAt: row.createdAt,
    });
  }

  static toPersistence(
    conversation: Conversation,
  ): Prisma.ConversationUncheckedCreateInput {
    return {
      id: conversation.id,
      propertyId: conversation.propertyId,
      clientId: conversation.clientId,
      adminId: conversation.adminId,
      createdAt: conversation.createdAt,
    };
  }
}
