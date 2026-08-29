import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../../shared/application/use-case.interface';
import { EntityNotFoundException } from '../../../../../shared/domain/exceptions/entity-not-found.exception';
import { PropertyRepository } from '../../../../properties/domain/repositories/property.repository';
import { PlanTier } from '../../../../plans/domain/enums/plan-tier.enum';
import { DeviceType } from '../../../domain/enums/device-type.enum';
import { PropertyAnalyticsEventRepository } from '../../../domain/repositories/property-analytics-event.repository';
import { AnalyticsAccessDeniedException } from '../../../domain/exceptions/analytics-access-denied.exception';
import { AssertAnalyticsAccessUseCase } from '../assert-analytics-access/assert-analytics-access.use-case';
import { GetPropertyAnalyticsDeviceBreakdownCommand } from './get-property-analytics-device-breakdown.command';

export interface PropertyAnalyticsDeviceBreakdownEntry {
  deviceType: DeviceType;
  count: number;
}

const DEVICE_TYPE_DISPLAY_ORDER: readonly DeviceType[] = [
  DeviceType.MOBILE,
  DeviceType.DESKTOP,
  DeviceType.UNKNOWN,
];

/**
 * Device breakdown for one property (PROFESSIONAL+, ownership-checked, same
 * pattern as GetPropertyAnalyticsSummaryUseCase). Computed over VIEW events
 * only — WHATSAPP_REVEAL/MESSAGE_STARTED never carry a deviceType (see
 * RecordAnalyticsEventCommand call sites), so a breakdown across every
 * event type would just lump every contact event into a spurious "no
 * device" bucket. All three DeviceType values are always present in the
 * result, zero-filled, so the caller never has to special-case a missing
 * bucket.
 */
@Injectable()
export class GetPropertyAnalyticsDeviceBreakdownUseCase implements UseCase<
  GetPropertyAnalyticsDeviceBreakdownCommand,
  PropertyAnalyticsDeviceBreakdownEntry[]
> {
  constructor(
    private readonly propertyRepository: PropertyRepository,
    private readonly analyticsEventRepository: PropertyAnalyticsEventRepository,
    private readonly assertAnalyticsAccessUseCase: AssertAnalyticsAccessUseCase,
  ) {}

  async execute(
    command: GetPropertyAnalyticsDeviceBreakdownCommand,
  ): Promise<PropertyAnalyticsDeviceBreakdownEntry[]> {
    await this.assertAnalyticsAccessUseCase.execute({
      adminId: command.adminId,
      minimumTier: PlanTier.PROFESSIONAL,
    });

    const property = await this.propertyRepository.findById(command.propertyId);
    if (!property) {
      throw new EntityNotFoundException('Property', command.propertyId);
    }
    if (!property.belongsTo(command.adminId)) {
      throw new AnalyticsAccessDeniedException(
        `Property "${command.propertyId}" does not belong to the authenticated admin`,
      );
    }

    const rows =
      await this.analyticsEventRepository.countByPropertyGroupedByDeviceType(
        property.id,
      );
    const countsByDevice = new Map(
      rows.map((row) => [row.deviceType, row.count]),
    );

    return DEVICE_TYPE_DISPLAY_ORDER.map((deviceType) => ({
      deviceType,
      count: countsByDevice.get(deviceType) ?? 0,
    }));
  }
}
