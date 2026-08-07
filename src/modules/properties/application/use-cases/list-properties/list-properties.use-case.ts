import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../../shared/application/use-case.interface';
import { Property } from '../../../domain/entities/property.entity';
import { PropertyRepository } from '../../../domain/repositories/property.repository';
import { PropertyFilters } from '../../../domain/repositories/property-filters.interface';

@Injectable()
export class ListPropertiesUseCase
  implements UseCase<PropertyFilters, Property[]>
{
  constructor(private readonly propertyRepository: PropertyRepository) {}

  async execute(filters: PropertyFilters): Promise<Property[]> {
    return this.propertyRepository.findMany(filters);
  }
}
