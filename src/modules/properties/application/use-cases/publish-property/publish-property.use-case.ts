import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../../shared/application/use-case.interface';
import { Property } from '../../../domain/entities/property.entity';
import { PropertyRepository } from '../../../domain/repositories/property.repository';
import { PublishPropertyCommand } from './publish-property.command';

@Injectable()
export class PublishPropertyUseCase
  implements UseCase<PublishPropertyCommand, Property>
{
  constructor(private readonly propertyRepository: PropertyRepository) {}

  async execute(command: PublishPropertyCommand): Promise<Property> {
    const property = Property.publish({
      adminId: command.adminId,
      title: command.title,
      description: command.description,
      address: command.address,
      state: command.state,
      municipality: command.municipality,
      type: command.type,
      operationType: command.operationType,
      price: command.price,
      bedrooms: command.bedrooms,
      bathrooms: command.bathrooms,
      parkingSpaces: command.parkingSpaces,
      squareMeters: command.squareMeters,
      images: command.images,
      videos: command.videos,
      whatsapp: command.whatsapp,
    });

    await this.propertyRepository.save(property);
    return property;
  }
}
