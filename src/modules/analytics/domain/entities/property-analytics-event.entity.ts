import { randomUUID } from 'node:crypto';
import { PropertyAnalyticsEventType } from '../enums/property-analytics-event-type.enum';
import { DeviceType } from '../enums/device-type.enum';

export class PropertyAnalyticsEvent {
  private constructor(
    private readonly _id: string,
    private readonly _propertyId: string,
    private readonly _type: PropertyAnalyticsEventType,
    private readonly _deviceType: DeviceType | null,
    private readonly _occurredAt: Date,
  ) {}

  static create(params: {
    propertyId: string;
    type: PropertyAnalyticsEventType;
    deviceType?: DeviceType | null;
  }): PropertyAnalyticsEvent {
    return new PropertyAnalyticsEvent(
      randomUUID(),
      params.propertyId,
      params.type,
      params.deviceType ?? null,
      new Date(),
    );
  }

  static reconstitute(params: {
    id: string;
    propertyId: string;
    type: PropertyAnalyticsEventType;
    deviceType: DeviceType | null;
    occurredAt: Date;
  }): PropertyAnalyticsEvent {
    return new PropertyAnalyticsEvent(
      params.id,
      params.propertyId,
      params.type,
      params.deviceType,
      params.occurredAt,
    );
  }

  get id(): string {
    return this._id;
  }

  get propertyId(): string {
    return this._propertyId;
  }

  get type(): PropertyAnalyticsEventType {
    return this._type;
  }

  get deviceType(): DeviceType | null {
    return this._deviceType;
  }

  get occurredAt(): Date {
    return this._occurredAt;
  }
}
