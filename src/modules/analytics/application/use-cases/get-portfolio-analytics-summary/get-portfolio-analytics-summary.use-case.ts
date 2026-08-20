import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../../shared/application/use-case.interface';
import { PropertyRepository } from '../../../../properties/domain/repositories/property.repository';
import { PlanTier } from '../../../../plans/domain/enums/plan-tier.enum';
import { PropertyAnalyticsEventType } from '../../../domain/enums/property-analytics-event-type.enum';
import { PropertyAnalyticsEventRepository } from '../../../domain/repositories/property-analytics-event.repository';
import { PropertyAnalyticsSummary } from '../../property-analytics-summary';
import { AssertAnalyticsAccessUseCase } from '../assert-analytics-access/assert-analytics-access.use-case';
import { GetPortfolioAnalyticsSummaryQuery } from './get-portfolio-analytics-summary.query';

/**
 * Portfolio-wide sibling of GetPropertyAnalyticsSummaryUseCase — same
 * shape, but aggregated across every property the admin owns. Batched via
 * countManyByPropertyAndType (one grouped query) instead of looping
 * countByPropertyAndType per property.
 *
 * Fase 4: the query may carry optional filters (type/operationType/state/
 * status narrow WHICH properties are aggregated, from/to narrow WHICH
 * events count by occurredAt). Per the plan, this is deliberately NOT a new
 * route — same GET /analytics/summary, filters are opt-in. Presence of ANY
 * filter param bumps the access gate to ENTERPRISE (fail-closed, see
 * hasAnyFilter() below); with zero filter params the behavior is byte-for-
 * byte identical to Fase 1 (STARTER+ gate, every property, full history).
 */
@Injectable()
export class GetPortfolioAnalyticsSummaryUseCase implements UseCase<
  GetPortfolioAnalyticsSummaryQuery,
  PropertyAnalyticsSummary
> {
  constructor(
    private readonly propertyRepository: PropertyRepository,
    private readonly analyticsEventRepository: PropertyAnalyticsEventRepository,
    private readonly assertAnalyticsAccessUseCase: AssertAnalyticsAccessUseCase,
  ) {}

  async execute(
    query: GetPortfolioAnalyticsSummaryQuery,
  ): Promise<PropertyAnalyticsSummary> {
    const filtered = hasAnyFilter(query);

    await this.assertAnalyticsAccessUseCase.execute({
      adminId: query.adminId,
      ...(filtered && { minimumTier: PlanTier.ENTERPRISE }),
    });

    const properties = await this.propertyRepository.findMany({
      adminId: query.adminId,
      ...(query.type && { type: query.type }),
      ...(query.operationType && { operationType: query.operationType }),
      ...(query.state && { state: query.state }),
      ...(query.status && { status: query.status }),
    });
    if (properties.length === 0) {
      return { totalViews: 0, totalContacts: 0, conversionRate: 0 };
    }

    const hasDateRange = query.from !== undefined || query.to !== undefined;
    const counts =
      await this.analyticsEventRepository.countManyByPropertyAndType(
        properties.map((property) => property.id),
        hasDateRange ? { since: query.from, until: query.to } : undefined,
      );

    let totalViews = 0;
    let totalContacts = 0;
    for (const row of counts) {
      if (row.type === PropertyAnalyticsEventType.VIEW) {
        totalViews += row.count;
      } else if (
        row.type === PropertyAnalyticsEventType.WHATSAPP_REVEAL ||
        row.type === PropertyAnalyticsEventType.MESSAGE_STARTED
      ) {
        totalContacts += row.count;
      }
    }

    return {
      totalViews,
      totalContacts,
      conversionRate: totalViews > 0 ? totalContacts / totalViews : 0,
    };
  }
}

/**
 * True when any Fase 4 filter param is present — property-level
 * (type/operationType/state/status) or date-range (from/to). Drives the
 * ENTERPRISE gate bump; the no-filter path never touches it, so it can't
 * regress Fase 1's STARTER+ behavior.
 */
function hasAnyFilter(query: GetPortfolioAnalyticsSummaryQuery): boolean {
  return (
    query.type !== undefined ||
    query.operationType !== undefined ||
    query.state !== undefined ||
    query.status !== undefined ||
    query.from !== undefined ||
    query.to !== undefined
  );
}
