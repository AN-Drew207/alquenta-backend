import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../../shared/application/use-case.interface';
import { EntityNotFoundException } from '../../../../../shared/domain/exceptions/entity-not-found.exception';
import { PropertyRepository } from '../../../../properties/domain/repositories/property.repository';
import { PropertyStatus } from '../../../../properties/domain/enums/property-status.enum';
import { PlanTier } from '../../../../plans/domain/enums/plan-tier.enum';
import { PropertyAnalyticsEventType } from '../../../domain/enums/property-analytics-event-type.enum';
import { PropertyAnalyticsEventRepository } from '../../../domain/repositories/property-analytics-event.repository';
import { AnalyticsAccessDeniedException } from '../../../domain/exceptions/analytics-access-denied.exception';
import { AssertAnalyticsAccessUseCase } from '../assert-analytics-access/assert-analytics-access.use-case';
import { GetPropertyAnalyticsBenchmarkCommand } from './get-property-analytics-benchmark.command';

/**
 * Below this many comparable listings, an average would be either noisy or
 * effectively identify a specific competitor's numbers — never computed.
 */
export const MINIMUM_COMPARABLE_PROPERTIES = 5;

export type PropertyAnalyticsBenchmark =
  | { available: false }
  | {
      available: true;
      comparableCount: number;
      avgViews: number;
      avgContacts: number;
      propertyViews: number;
      propertyContacts: number;
    };

/**
 * Benchmarks one property's views/contacts against comparable listings —
 * same state + type + operationType, status AVAILABLE, excluding every
 * property owned by the calling admin (not just this one — an admin with
 * several matching listings shouldn't be compared against themselves).
 * BUSINESS+, ownership-checked, same gate pattern as every other
 * per-property use-case in this module. Computed live per request, no
 * pre-aggregation/snapshot table (a deliberate plan decision, not an
 * oversight).
 */
@Injectable()
export class GetPropertyAnalyticsBenchmarkUseCase implements UseCase<
  GetPropertyAnalyticsBenchmarkCommand,
  PropertyAnalyticsBenchmark
> {
  constructor(
    private readonly propertyRepository: PropertyRepository,
    private readonly analyticsEventRepository: PropertyAnalyticsEventRepository,
    private readonly assertAnalyticsAccessUseCase: AssertAnalyticsAccessUseCase,
  ) {}

  async execute(
    command: GetPropertyAnalyticsBenchmarkCommand,
  ): Promise<PropertyAnalyticsBenchmark> {
    await this.assertAnalyticsAccessUseCase.execute({
      adminId: command.adminId,
      minimumTier: PlanTier.BUSINESS,
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

    const candidates = await this.propertyRepository.findMany({
      state: property.state,
      type: property.type,
      operationType: property.operationType,
      status: PropertyStatus.AVAILABLE,
    });
    const comparables = candidates.filter(
      (candidate) => candidate.adminId !== command.adminId,
    );

    if (comparables.length < MINIMUM_COMPARABLE_PROPERTIES) {
      return { available: false };
    }

    const counts =
      await this.analyticsEventRepository.countManyByPropertyAndType([
        property.id,
        ...comparables.map((comparable) => comparable.id),
      ]);

    const countsByProperty = new Map<
      string,
      { views: number; contacts: number }
    >();
    for (const row of counts) {
      const bucket = countsByProperty.get(row.propertyId) ?? {
        views: 0,
        contacts: 0,
      };
      if (row.type === PropertyAnalyticsEventType.VIEW) {
        bucket.views += row.count;
      } else if (
        row.type === PropertyAnalyticsEventType.WHATSAPP_REVEAL ||
        row.type === PropertyAnalyticsEventType.MESSAGE_STARTED
      ) {
        bucket.contacts += row.count;
      }
      countsByProperty.set(row.propertyId, bucket);
    }

    const ownBucket = countsByProperty.get(property.id) ?? {
      views: 0,
      contacts: 0,
    };

    let comparableTotalViews = 0;
    let comparableTotalContacts = 0;
    for (const comparable of comparables) {
      const bucket = countsByProperty.get(comparable.id) ?? {
        views: 0,
        contacts: 0,
      };
      comparableTotalViews += bucket.views;
      comparableTotalContacts += bucket.contacts;
    }

    return {
      available: true,
      comparableCount: comparables.length,
      avgViews: comparableTotalViews / comparables.length,
      avgContacts: comparableTotalContacts / comparables.length,
      propertyViews: ownBucket.views,
      propertyContacts: ownBucket.contacts,
    };
  }
}
