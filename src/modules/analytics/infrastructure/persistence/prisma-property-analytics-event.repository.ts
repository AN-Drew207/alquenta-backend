import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../../../generated/prisma/client';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { TransactionContext } from '../../../../shared/domain/transaction/transaction-context';
import { PropertyAnalyticsEvent } from '../../domain/entities/property-analytics-event.entity';
import { PropertyAnalyticsEventType } from '../../domain/enums/property-analytics-event-type.enum';
import { DeviceType } from '../../domain/enums/device-type.enum';
import {
  PropertyAnalyticsDailyCount,
  PropertyAnalyticsDeviceCount,
  PropertyAnalyticsEventCount,
  PropertyAnalyticsEventRepository,
} from '../../domain/repositories/property-analytics-event.repository';
import { PropertyAnalyticsEventMapper } from './property-analytics-event.mapper';

/** Row shape of the raw date_trunc() query below — one row per (day, type). */
interface DayTypeCountRow {
  day: Date;
  type: PropertyAnalyticsEventType;
  count: number;
}

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

  async countByPropertyGroupedByDay(
    propertyId: string,
    since: Date | null,
  ): Promise<PropertyAnalyticsDailyCount[]> {
    // First $queryRaw in the codebase: Prisma's groupBy() can't truncate a
    // timestamp to a calendar day, so this drops to raw SQL for date_trunc().
    // propertyId and since are both passed as tagged-template parameters
    // (never string-concatenated), so Prisma parameterizes them like any
    // other query — no injection surface.
    const dateFilter = since
      ? Prisma.sql`AND "occurredAt" >= ${since}`
      : Prisma.empty;

    const rows = await this.prisma.$queryRaw<DayTypeCountRow[]>(Prisma.sql`
      SELECT
        date_trunc('day', "occurredAt") AS "day",
        "type" AS "type",
        COUNT(*)::int AS "count"
      FROM "PropertyAnalyticsEvent"
      WHERE "propertyId" = ${propertyId}
      ${dateFilter}
      GROUP BY "day", "type"
      ORDER BY "day" ASC
    `);

    const byDay = new Map<string, PropertyAnalyticsDailyCount>();
    for (const row of rows) {
      const key = row.day.toISOString();
      const bucket = byDay.get(key) ?? {
        day: row.day,
        viewCount: 0,
        contactCount: 0,
      };
      if (row.type === PropertyAnalyticsEventType.VIEW) {
        bucket.viewCount += row.count;
      } else if (
        row.type === PropertyAnalyticsEventType.WHATSAPP_REVEAL ||
        row.type === PropertyAnalyticsEventType.MESSAGE_STARTED
      ) {
        bucket.contactCount += row.count;
      }
      byDay.set(key, bucket);
    }

    return Array.from(byDay.values()).sort(
      (a, b) => a.day.getTime() - b.day.getTime(),
    );
  }

  async countByPropertyGroupedByDeviceType(
    propertyId: string,
  ): Promise<PropertyAnalyticsDeviceCount[]> {
    // Grouping by an enum column (not a truncated timestamp), so Prisma's
    // native groupBy() is enough here — unlike countByPropertyGroupedByDay,
    // no raw SQL needed. Scoped to VIEW: it's the only event type that ever
    // records a deviceType (WHATSAPP_REVEAL/MESSAGE_STARTED never do).
    const rows = await this.prisma.propertyAnalyticsEvent.groupBy({
      by: ['deviceType'],
      where: { propertyId, type: PropertyAnalyticsEventType.VIEW },
      _count: { _all: true },
    });
    return rows.map((row) => ({
      deviceType: (row.deviceType ?? DeviceType.UNKNOWN) as DeviceType,
      count: row._count._all,
    }));
  }
}
