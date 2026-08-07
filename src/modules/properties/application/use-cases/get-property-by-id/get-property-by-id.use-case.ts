import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../../shared/application/use-case.interface';
import { EntityNotFoundException } from '../../../../../shared/domain/exceptions/entity-not-found.exception';
import { Property } from '../../../domain/entities/property.entity';
import { PropertyRepository } from '../../../domain/repositories/property.repository';

@Injectable()
export class GetPropertyByIdUseCase implements UseCase<string, Property> {
  constructor(private readonly propertyRepository: PropertyRepository) {}

  async execute(propertyId: string): Promise<Property> {
    const property = await this.propertyRepository.findById(propertyId);
    if (!property) {
      throw new EntityNotFoundException('Property', propertyId);
    }
    return property;
  }
}
