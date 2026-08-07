import {
  Prisma,
  Message as PrismaMessage,
} from '../../../../../generated/prisma/client';
import { Message } from '../../domain/entities/message.entity';

export class MessageMapper {
  static toDomain(row: PrismaMessage): Message {
    return Message.reconstitute({
      id: row.id,
      conversationId: row.conversationId,
      authorId: row.authorId,
      content: row.content,
      offerAmount: row.offerAmount === null ? null : Number(row.offerAmount),
      read: row.read,
      createdAt: row.createdAt,
    });
  }

  static toPersistence(message: Message): Prisma.MessageUncheckedCreateInput {
    return {
      id: message.id,
      conversationId: message.conversationId,
      authorId: message.authorId,
      content: message.content,
      offerAmount: message.offerAmount,
      read: message.read,
      createdAt: message.createdAt,
    };
  }
}
