import { Property } from '../../../domain/entities/property.entity';
import { PropertyResponseDto } from '../dto/property-response.dto';

export class PropertyResponseMapper {
  static toDto(property: Property): PropertyResponseDto {
    return {
      id: property.id,
      adminId: property.adminId,
      title: property.title,
      description: property.description,
      address: property.address,
      city: property.city,
      type: property.type,
      operationType: property.operationType,
      price: property.price,
      status: property.status,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      squareMeters: property.squareMeters,
      images: property.images,
      createdAt: property.createdAt,
    };
  }
}
