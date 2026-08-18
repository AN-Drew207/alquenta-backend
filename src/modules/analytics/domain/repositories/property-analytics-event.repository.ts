import { TransactionContext } from '../../../../shared/domain/transaction/transaction-context';
import { PropertyAnalyticsEvent } from '../entities/property-analytics-event.entity';
import { PropertyAnalyticsEventType } from '../enums/property-analytics-event-type.enum';

export interface PropertyAnalyticsEventCount {
  propertyId: string;
  type: PropertyAnalyticsEventType;
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
}
