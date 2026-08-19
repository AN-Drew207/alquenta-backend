import { TransactionContext } from '../../../../shared/domain/transaction/transaction-context';
import { PropertyAnalyticsEvent } from '../entities/property-analytics-event.entity';
import { PropertyAnalyticsEventType } from '../enums/property-analytics-event-type.enum';
import { DeviceType } from '../enums/device-type.enum';

export interface PropertyAnalyticsEventCount {
  propertyId: string;
  type: PropertyAnalyticsEventType;
  count: number;
}

export interface PropertyAnalyticsDailyCount {
  day: Date;
  viewCount: number;
  contactCount: number;
}

export interface PropertyAnalyticsDeviceCount {
  deviceType: DeviceType;
  count: number;
}

export abstract class PropertyAnalyticsEventRepository {
  abstract save(
    event: PropertyAnalyticsEvent,
    ctx?: TransactionContext,
  ): Promise<void>;
  abstract countByPropertyAndType(
    propertyId: string,
    type: PropertyAnalyticsEventType,
  ): Promise<number>;
  /**
   * Batched: one grouped query for many properties at once (an admin's
   * whole portfolio), rather than N per-property queries.
   */
  abstract countManyByPropertyAndType(
    propertyIds: string[],
  ): Promise<PropertyAnalyticsEventCount[]>;
  /**
   * Daily-bucketed view/contact counts for one property, from `since`
   * (inclusive) onward, or the property's full history when `since` is
   * null (ENTERPRISE tier — no lower bound). Only days with at least one
   * event are returned, sorted ascending by day — gap-filling into a
   * continuous day-ordered series is application-layer work (see
   * GetPropertyAnalyticsTrendUseCase).
   */
  abstract countByPropertyGroupedByDay(
    propertyId: string,
    since: Date | null,
  ): Promise<PropertyAnalyticsDailyCount[]>;
  /**
   * VIEW-event counts for one property grouped by DeviceType — the only
   * event type that ever records a deviceType (see
   * RecordAnalyticsEventCommand call sites).
   */
  abstract countByPropertyGroupedByDeviceType(
    propertyId: string,
  ): Promise<PropertyAnalyticsDeviceCount[]>;
  /**
   * Count of contact events (WHATSAPP_REVEAL + MESSAGE_STARTED combined)
   * for one property, from `since` (inclusive) onward. Used by
   * CheckNoContactsAlertsUseCase's 14-day "no recent contacts" check —
   * unlike countByPropertyGroupedByDay, this needs a single number, not a
   * day-bucketed series, so it doesn't warrant the raw-SQL date_trunc()
   * query that method uses.
   */
  abstract countContactEventsSince(
    propertyId: string,
    since: Date,
  ): Promise<number>;
}
