import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../../shared/application/use-case.interface';
import { EntityNotFoundException } from '../../../../../shared/domain/exceptions/entity-not-found.exception';
import { Property } from '../../../domain/entities/property.entity';
import { PropertyRepository } from '../../../domain/repositories/property.repository';
import { PropertyStatus } from '../../../domain/enums/property-status.enum';
import { CancelPropertyCommand } from './cancel-property.command';

/** Superadmin oversight action: cancels any admin's listing regardless of ownership. */
@Injectable()
export class CancelPropertyUseCase
  implements UseCase<CancelPropertyCommand, Property>
{
  constructor(private readonly propertyRepository: PropertyRepository) {}

  async execute(command: CancelPropertyCommand): Promise<Property> {
    const property = await this.propertyRepository.findById(
      command.propertyId,
    );
    if (!property) {
      throw new EntityNotFoundException('Property', command.propertyId);
    }

    property.updateDetails({ status: PropertyStatus.CANCELLED });
    await this.propertyRepository.save(property);
    return property;
  }
}
