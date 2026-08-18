import {
  Prisma,
  PropertyAnalyticsEvent as PrismaPropertyAnalyticsEvent,
} from '../../../../../generated/prisma/client';
import { PropertyAnalyticsEvent } from '../../domain/entities/property-analytics-event.entity';
import { PropertyAnalyticsEventType } from '../../domain/enums/property-analytics-event-type.enum';
import { DeviceType } from '../../domain/enums/device-type.enum';

export class PropertyAnalyticsEventMapper {
  static toDomain(row: PrismaPropertyAnalyticsEvent): PropertyAnalyticsEvent {
    return PropertyAnalyticsEvent.reconstitute({
      id: row.id,
      propertyId: row.propertyId,
      type: row.type as PropertyAnalyticsEventType,
      deviceType: row.deviceType as DeviceType | null,
      occurredAt: row.occurredAt,
    });
  }

  static toPersistence(
    event: PropertyAnalyticsEvent,
  ): Prisma.PropertyAnalyticsEventUncheckedCreateInput {
    return {
      id: event.id,
      propertyId: event.propertyId,
      type: event.type,
      deviceType: event.deviceType,
      occurredAt: event.occurredAt,
    };
  }
}
