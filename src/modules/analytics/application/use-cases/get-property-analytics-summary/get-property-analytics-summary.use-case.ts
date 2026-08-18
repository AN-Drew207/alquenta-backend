import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../../shared/application/use-case.interface';
import { EntityNotFoundException } from '../../../../../shared/domain/exceptions/entity-not-found.exception';
import { PropertyRepository } from '../../../../properties/domain/repositories/property.repository';
import { PropertyAnalyticsEventType } from '../../../domain/enums/property-analytics-event-type.enum';
import { PropertyAnalyticsEventRepository } from '../../../domain/repositories/property-analytics-event.repository';
import { AnalyticsAccessDeniedException } from '../../../domain/exceptions/analytics-access-denied.exception';
import { PropertyAnalyticsSummary } from '../../property-analytics-summary';
import { AssertAnalyticsAccessUseCase } from '../assert-analytics-access/assert-analytics-access.use-case';
import { GetPropertyAnalyticsSummaryCommand } from './get-property-analytics-summary.command';

@Injectable()
export class GetPropertyAnalyticsSummaryUseCase implements UseCase<
  GetPropertyAnalyticsSummaryCommand,
  PropertyAnalyticsSummary
> {
  constructor(
    private readonly propertyRepository: PropertyRepository,
    private readonly analyticsEventRepository: PropertyAnalyticsEventRepository,
    private readonly assertAnalyticsAccessUseCase: AssertAnalyticsAccessUseCase,
  ) {}

  async execute(
    command: GetPropertyAnalyticsSummaryCommand,
  ): Promise<PropertyAnalyticsSummary> {
    await this.assertAnalyticsAccessUseCase.execute({
      adminId: command.adminId,
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
      totalViews: views,
      totalContacts,
      conversionRate: views > 0 ? totalContacts / views : 0,
    };
  }
}
