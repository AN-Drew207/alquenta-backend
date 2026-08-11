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
      state: property.state,
      municipality: property.municipality,
      type: property.type,
      operationType: property.operationType,
      price: property.price,
      status: property.status,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      parkingSpaces: property.parkingSpaces,
      squareMeters: property.squareMeters,
      images: property.images,
      videos: property.videos,
      createdAt: property.createdAt,
    };
  }
}
