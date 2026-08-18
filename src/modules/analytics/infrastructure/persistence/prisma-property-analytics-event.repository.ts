import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../../../generated/prisma/client';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { TransactionContext } from '../../../../shared/domain/transaction/transaction-context';
import { PropertyAnalyticsEvent } from '../../domain/entities/property-analytics-event.entity';
import { PropertyAnalyticsEventType } from '../../domain/enums/property-analytics-event-type.enum';
import {
  PropertyAnalyticsEventCount,
  PropertyAnalyticsEventRepository,
} from '../../domain/repositories/property-analytics-event.repository';
import { PropertyAnalyticsEventMapper } from './property-analytics-event.mapper';

@Injectable()
export class PrismaPropertyAnalyticsEventRepository implements PropertyAnalyticsEventRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(
    event: PropertyAnalyticsEvent,
    ctx?: TransactionContext,
  ): Promise<void> {
    const client = (ctx as Prisma.TransactionClient | undefined) ?? this.prisma;
    // Analytics events are append-only (no domain mutation/setters), so a
    // plain create is correct here — unlike the upsert-by-id pattern other
    // repositories use to persist entities that can also be updated.
    await client.propertyAnalyticsEvent.create({
      data: PropertyAnalyticsEventMapper.toPersistence(event),
    });
  }

  async countByPropertyAndType(
    propertyId: string,
    type: PropertyAnalyticsEventType,
  ): Promise<number> {
    return this.prisma.propertyAnalyticsEvent.count({
      where: { propertyId, type },
    });
  }

  async countManyByPropertyAndType(
    propertyIds: string[],
  ): Promise<PropertyAnalyticsEventCount[]> {
    if (propertyIds.length === 0) return [];
    const rows = await this.prisma.propertyAnalyticsEvent.groupBy({
      by: ['propertyId', 'type'],
      where: { propertyId: { in: propertyIds } },
      _count: { _all: true },
    });
    return rows.map((row) => ({
      propertyId: row.propertyId,
      type: row.type as PropertyAnalyticsEventType,
      count: row._count._all,
    }));
  }
}
