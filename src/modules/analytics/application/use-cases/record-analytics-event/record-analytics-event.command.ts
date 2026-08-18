import { PropertyAnalyticsEventType } from '../../../domain/enums/property-analytics-event-type.enum';
import { DeviceType } from '../../../domain/enums/device-type.enum';

export class RecordAnalyticsEventCommand {
  constructor(
    readonly propertyId: string,
    readonly type: PropertyAnalyticsEventType,
    readonly deviceType?: DeviceType | null,
  ) {}
}
