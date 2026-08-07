import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../../shared/application/use-case.interface';
import { EntityNotFoundException } from '../../../../../shared/domain/exceptions/entity-not-found.exception';
import { Property } from '../../../domain/entities/property.entity';
import { PropertyRepository } from '../../../domain/repositories/property.repository';
import { PropertyNotOwnedByAdminException } from '../../../domain/exceptions/property-not-owned-by-admin.exception';
import { UpdatePropertyCommand } from './update-property.command';

@Injectable()
export class UpdatePropertyUseCase
  implements UseCase<UpdatePropertyCommand, Property>
{
  constructor(private readonly propertyRepository: PropertyRepository) {}

  async execute(command: UpdatePropertyCommand): Promise<Property> {
    const property = await this.propertyRepository.findById(
      command.propertyId,
    );
    if (!property) {
      throw new EntityNotFoundException('Property', command.propertyId);
    }
    if (!property.belongsTo(command.adminId)) {
      throw new PropertyNotOwnedByAdminException(command.propertyId);
    }

    property.updateDetails(command.changes);
    await this.propertyRepository.save(property);
    return property;
  }
}
