import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../../../generated/prisma/client';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { TransactionContext } from '../../../../shared/domain/transaction/transaction-context';
import { Message } from '../../domain/entities/message.entity';
import { MessageRepository } from '../../domain/repositories/message.repository';
import { MessageMapper } from './message.mapper';

@Injectable()
export class PrismaMessageRepository implements MessageRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(message: Message, ctx?: TransactionContext): Promise<void> {
    const client = (ctx as Prisma.TransactionClient | undefined) ?? this.prisma;
    const data = MessageMapper.toPersistence(message);
    await client.message.upsert({
      where: { id: data.id },
      create: data,
      update: data,
    });
  }

  async findManyByConversation(conversationId: string): Promise<Message[]> {
    const rows = await this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map(MessageMapper.toDomain);
  }

  async markAsReadExcludingAuthor(
    conversationId: string,
    readerId: string,
    ctx?: TransactionContext,
  ): Promise<void> {
    const client = (ctx as Prisma.TransactionClient | undefined) ?? this.prisma;
    await client.message.updateMany({
      where: { conversationId, authorId: { not: readerId }, read: false },
      data: { read: true },
    });
  }
}
