import {
  Prisma,
  Conversation as PrismaConversation,
  User as PrismaUser,
} from '../../../../../generated/prisma/client';
import { Conversation } from '../../domain/entities/conversation.entity';

export class ConversationMapper {
  static toDomain(
    row: PrismaConversation & { client: PrismaUser; admin: PrismaUser },
  ): Conversation {
    return Conversation.reconstitute({
      id: row.id,
      propertyId: row.propertyId,
      clientId: row.clientId,
      clientName: row.client.name,
      adminId: row.adminId,
      adminName: row.admin.name,
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
