import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../../shared/application/use-case.interface';
import { EntityNotFoundException } from '../../../../../shared/domain/exceptions/entity-not-found.exception';
import { PropertyRepository } from '../../../../properties/domain/repositories/property.repository';
import { PropertyAnalyticsEventType } from '../../../domain/enums/property-analytics-event-type.enum';
import { RecordAnalyticsEventUseCase } from '../record-analytics-event/record-analytics-event.use-case';
import { RecordAnalyticsEventCommand } from '../record-analytics-event/record-analytics-event.command';
import { RecordPropertyViewCommand } from './record-property-view.command';

@Injectable()
export class RecordPropertyViewUseCase implements UseCase<
  RecordPropertyViewCommand,
  void
> {
  constructor(
    private readonly propertyRepository: PropertyRepository,
    private readonly recordAnalyticsEventUseCase: RecordAnalyticsEventUseCase,
  ) {}

  async execute(command: RecordPropertyViewCommand): Promise<void> {
    const property = await this.propertyRepository.findById(command.propertyId);
    if (!property) {
      throw new EntityNotFoundException('Property', command.propertyId);
    }

    await this.recordAnalyticsEventUseCase.execute(
      new RecordAnalyticsEventCommand(
        command.propertyId,
        PropertyAnalyticsEventType.VIEW,
        command.deviceType,
      ),
    );
  }
}
