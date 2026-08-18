import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../../shared/application/use-case.interface';
import { PropertyRepository } from '../../../../properties/domain/repositories/property.repository';
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
    await this.assertAnalyticsAccessUseCase.execute({
      adminId: query.adminId,
    });

    const properties = await this.propertyRepository.findMany({
      adminId: query.adminId,
    });
    if (properties.length === 0) {
      return { totalViews: 0, totalContacts: 0, conversionRate: 0 };
    }

    const counts =
      await this.analyticsEventRepository.countManyByPropertyAndType(
        properties.map((property) => property.id),
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
