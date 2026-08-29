import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../../../generated/prisma/client';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { TransactionContext } from '../../../../shared/domain/transaction/transaction-context';
import { Notification } from '../../domain/entities/notification.entity';
import { NotificationRepository } from '../../domain/repositories/notification.repository';
import { NotificationType } from '../../domain/enums/notification-type.enum';
import { NotificationMapper } from './notification.mapper';

@Injectable()
export class PrismaNotificationRepository implements NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(
    notification: Notification,
    ctx?: TransactionContext,
  ): Promise<void> {
    const client = (ctx as Prisma.TransactionClient | undefined) ?? this.prisma;
    const data = NotificationMapper.toPersistence(notification);
    await client.notification.upsert({
      where: { id: data.id },
      create: data,
      update: data,
    });
  }

  async findById(id: string): Promise<Notification | null> {
    const row = await this.prisma.notification.findUnique({ where: { id } });
    return row ? NotificationMapper.toDomain(row) : null;
  }

  async findManyByRecipient(recipientUserId: string): Promise<Notification[]> {
    const rows = await this.prisma.notification.findMany({
      where: { recipientUserId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => NotificationMapper.toDomain(row));
  }

  async existsRecentByPropertyAndType(
    propertyId: string,
    type: NotificationType,
    since: Date,
  ): Promise<boolean> {
    const match = await this.prisma.notification.findFirst({
      where: { propertyId, type, createdAt: { gte: since } },
      select: { id: true },
    });
    return match !== null;
  }
}
