import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../../../generated/prisma/client';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { TransactionContext } from '../../../../shared/domain/transaction/transaction-context';
import { Conversation } from '../../domain/entities/conversation.entity';
import { ConversationRepository } from '../../domain/repositories/conversation.repository';
import { ConversationMapper } from './conversation.mapper';

@Injectable()
export class PrismaConversationRepository implements ConversationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findOrCreate(
    candidate: Conversation,
    ctx?: TransactionContext,
  ): Promise<Conversation> {
    const client = (ctx as Prisma.TransactionClient | undefined) ?? this.prisma;
    const data = ConversationMapper.toPersistence(candidate);
    const row = await client.conversation.upsert({
      where: {
        propertyId_clientId: {
          propertyId: data.propertyId,
          clientId: data.clientId,
        },
      },
      create: data,
      update: {},
      include: { client: true, admin: true },
    });
    return ConversationMapper.toDomain(row);
  }

  async findById(id: string): Promise<Conversation | null> {
    const row = await this.prisma.conversation.findUnique({
      where: { id },
      include: { client: true, admin: true },
    });
    return row ? ConversationMapper.toDomain(row) : null;
  }

  async findManyByUser(userId: string): Promise<Conversation[]> {
    const rows = await this.prisma.conversation.findMany({
      where: { OR: [{ clientId: userId }, { adminId: userId }] },
      orderBy: { createdAt: 'desc' },
      include: { client: true, admin: true },
    });
    return rows.map((row) => ConversationMapper.toDomain(row));
  }

  async findManyByAdminId(adminId: string): Promise<Conversation[]> {
    const rows = await this.prisma.conversation.findMany({
      where: { adminId },
      include: { client: true, admin: true },
    });
    return rows.map((row) => ConversationMapper.toDomain(row));
  }
}
