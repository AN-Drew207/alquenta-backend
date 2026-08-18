import { Property } from '../../../domain/entities/property.entity';
import { PropertyResponseDto } from '../dto/property-response.dto';
import { PublicPropertyResponseDto } from '../dto/public-property-response.dto';

export class PropertyResponseMapper {
  /** Owner (the admin who owns it) or SUPERADMIN oversight — includes the
   * raw whatsapp override. Never use this for a response an arbitrary
   * authenticated user (e.g. a CLIENT browsing/favoriting) can reach. */
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
      whatsapp: property.whatsapp,
      latitude: property.latitude,
      longitude: property.longitude,
      createdAt: property.createdAt,
    };
  }

  /** Public / any-authenticated-user-reachable — never includes a raw
   * phone number, only whether one exists and (optionally) a short-lived
   * token to redeem it via the reveal-contact endpoint. */
  static toPublicDto(
    property: Property,
    contactReveal?: { hasWhatsappContact: boolean; revealToken: string | null },
  ): PublicPropertyResponseDto {
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
      latitude: property.latitude,
      longitude: property.longitude,
      hasWhatsappContact:
        contactReveal?.hasWhatsappContact ?? !!property.whatsapp,
      contactRevealToken: contactReveal?.revealToken ?? null,
      createdAt: property.createdAt,
    };
  }
}
