import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../../shared/application/use-case.interface';
import { EntityNotFoundException } from '../../../../../shared/domain/exceptions/entity-not-found.exception';
import { PropertyRepository } from '../../../../properties/domain/repositories/property.repository';
import { PlanTier } from '../../../../plans/domain/enums/plan-tier.enum';
import { PropertyAnalyticsEventType } from '../../../domain/enums/property-analytics-event-type.enum';
import { PropertyAnalyticsEventRepository } from '../../../domain/repositories/property-analytics-event.repository';
import { AnalyticsAccessDeniedException } from '../../../domain/exceptions/analytics-access-denied.exception';
import { AssertAnalyticsAccessUseCase } from '../assert-analytics-access/assert-analytics-access.use-case';
import { GetPropertyAnalyticsExportDataCommand } from './get-property-analytics-export-data.command';

/**
 * Everything the CSV/PDF serializers need for one property's export report.
 * A summary snapshot (same numbers as GetPropertyAnalyticsSummaryUseCase),
 * plus the property title and a generation timestamp for the report header
 * — Fase 3's export is per-property only, no portfolio-wide export (that's
 * implicitly Fase 4 scope).
 */
export interface PropertyAnalyticsExportData {
  propertyId: string;
  propertyTitle: string;
  generatedAt: Date;
  totalViews: number;
  totalContacts: number;
  conversionRate: number;
}

/**
 * Feeds AnalyticsController's export endpoint (BUSINESS+, ownership-checked
 * — same gate pattern as GetPropertyAnalyticsBenchmarkUseCase). Kept as its
 * own use-case rather than reusing GetPropertyAnalyticsSummaryUseCase so the
 * BUSINESS+ gate is asserted exactly once per request, with the export's
 * own PropertyAnalyticsExportData shape.
 */
@Injectable()
export class GetPropertyAnalyticsExportDataUseCase implements UseCase<
  GetPropertyAnalyticsExportDataCommand,
  PropertyAnalyticsExportData
> {
  constructor(
    private readonly propertyRepository: PropertyRepository,
    private readonly analyticsEventRepository: PropertyAnalyticsEventRepository,
    private readonly assertAnalyticsAccessUseCase: AssertAnalyticsAccessUseCase,
  ) {}

  async execute(
    command: GetPropertyAnalyticsExportDataCommand,
  ): Promise<PropertyAnalyticsExportData> {
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

    const [views, whatsappReveals, messagesStarted] = await Promise.all([
      this.analyticsEventRepository.countByPropertyAndType(
        property.id,
        PropertyAnalyticsEventType.VIEW,
      ),
      this.analyticsEventRepository.countByPropertyAndType(
        property.id,
        PropertyAnalyticsEventType.WHATSAPP_REVEAL,
      ),
      this.analyticsEventRepository.countByPropertyAndType(
        property.id,
        PropertyAnalyticsEventType.MESSAGE_STARTED,
      ),
    ]);
    const totalContacts = whatsappReveals + messagesStarted;

    return {
      propertyId: property.id,
      propertyTitle: property.title,
      generatedAt: new Date(),
      totalViews: views,
      totalContacts,
      conversionRate: views > 0 ? totalContacts / views : 0,
    };
  }
}
