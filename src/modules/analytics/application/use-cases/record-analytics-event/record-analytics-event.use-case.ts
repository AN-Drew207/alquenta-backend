import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../../shared/application/use-case.interface';
import { PropertyAnalyticsEvent } from '../../../domain/entities/property-analytics-event.entity';
import { PropertyAnalyticsEventRepository } from '../../../domain/repositories/property-analytics-event.repository';
import { RecordAnalyticsEventCommand } from './record-analytics-event.command';

/**
 * Low-level event writer, deliberately with no property-existence check —
 * every instrumentation call site (reveal-contact, start-conversation, the
 * public view endpoint via RecordPropertyViewUseCase) has already resolved
 * the property by the time it calls this. Reused across all three event
 * types so instrumentation stays a one-line call.
 */
@Injectable()
export class RecordAnalyticsEventUseCase implements UseCase<
  RecordAnalyticsEventCommand,
  void
> {
  constructor(
    private readonly analyticsEventRepository: PropertyAnalyticsEventRepository,
  ) {}

  async execute(command: RecordAnalyticsEventCommand): Promise<void> {
    const event = PropertyAnalyticsEvent.create({
      propertyId: command.propertyId,
      type: command.type,
      deviceType: command.deviceType,
    });
    await this.analyticsEventRepository.save(event);
  }
}
