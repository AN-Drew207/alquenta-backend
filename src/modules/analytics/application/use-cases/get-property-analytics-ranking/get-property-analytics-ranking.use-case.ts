import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../../shared/application/use-case.interface';
import { PropertyRepository } from '../../../../properties/domain/repositories/property.repository';
import { PlanTier } from '../../../../plans/domain/enums/plan-tier.enum';
import { PropertyAnalyticsEventType } from '../../../domain/enums/property-analytics-event-type.enum';
import { PropertyAnalyticsEventRepository } from '../../../domain/repositories/property-analytics-event.repository';
import { AssertAnalyticsAccessUseCase } from '../assert-analytics-access/assert-analytics-access.use-case';
import { GetPropertyAnalyticsRankingQuery } from './get-property-analytics-ranking.query';

export interface PropertyAnalyticsRankingEntry {
  propertyId: string;
  title: string;
  totalViews: number;
  totalContacts: number;
  conversionRate: number;
}

/**
 * Portfolio-wide ranking (PROFESSIONAL+, like GetPortfolioAnalyticsSummaryUseCase
 * — not per-property), one entry per property the admin owns. Ranked by
 * totalViews descending: raw traffic is the clearest at-a-glance
 * "which listings are over/under-performing" signal for a list view; ties
 * are broken by conversionRate descending so an equally-viewed listing that
 * converts better surfaces first. Batched via countManyByPropertyAndType
 * (one grouped query, same pattern as GetPortfolioAnalyticsSummaryUseCase)
 * — no N+1 across the portfolio.
 */
@Injectable()
export class GetPropertyAnalyticsRankingUseCase implements UseCase<
  GetPropertyAnalyticsRankingQuery,
  PropertyAnalyticsRankingEntry[]
> {
  constructor(
    private readonly propertyRepository: PropertyRepository,
    private readonly analyticsEventRepository: PropertyAnalyticsEventRepository,
    private readonly assertAnalyticsAccessUseCase: AssertAnalyticsAccessUseCase,
  ) {}

  async execute(
    query: GetPropertyAnalyticsRankingQuery,
  ): Promise<PropertyAnalyticsRankingEntry[]> {
    await this.assertAnalyticsAccessUseCase.execute({
      adminId: query.adminId,
      minimumTier: PlanTier.PROFESSIONAL,
    });

    const properties = await this.propertyRepository.findMany({
      adminId: query.adminId,
    });
    if (properties.length === 0) return [];

    const counts =
      await this.analyticsEventRepository.countManyByPropertyAndType(
        properties.map((property) => property.id),
      );

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

    return properties
      .map((property) => {
        const bucket = countsByProperty.get(property.id) ?? {
          views: 0,
          contacts: 0,
        };
        return {
          propertyId: property.id,
          title: property.title,
          totalViews: bucket.views,
          totalContacts: bucket.contacts,
          conversionRate: bucket.views > 0 ? bucket.contacts / bucket.views : 0,
        };
      })
      .sort(
        (a, b) =>
          b.totalViews - a.totalViews || b.conversionRate - a.conversionRate,
      );
  }
}
