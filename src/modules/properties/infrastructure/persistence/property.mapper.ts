import {
  Prisma,
  Property as PrismaProperty,
} from '../../../../../generated/prisma/client';
import { Property } from '../../domain/entities/property.entity';
import { PropertyType } from '../../domain/enums/property-type.enum';
import { OperationType } from '../../domain/enums/operation-type.enum';
import { PropertyStatus } from '../../domain/enums/property-status.enum';

export class PropertyMapper {
  static toDomain(row: PrismaProperty): Property {
    return Property.reconstitute({
      id: row.id,
      adminId: row.adminId,
      title: row.title,
      description: row.description,
      address: row.address,
      state: row.state,
      municipality: row.municipality,
      type: row.type as PropertyType,
      operationType: row.operationType as OperationType,
      price: Number(row.price),
      status: row.status as PropertyStatus,
      bedrooms: row.bedrooms,
      bathrooms: row.bathrooms,
      parkingSpaces: row.parkingSpaces,
      squareMeters: row.squareMeters === null ? null : Number(row.squareMeters),
      images: row.images,
      videos: row.videos,
      whatsapp: row.whatsapp,
      latitude: row.latitude,
      longitude: row.longitude,
      cancelledAt: row.cancelledAt,
      createdAt: row.createdAt,
    });
  }

  static toPersistence(
    property: Property,
  ): Prisma.PropertyUncheckedCreateInput {
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
      cancelledAt: property.cancelledAt,
      createdAt: property.createdAt,
    };
  }
}
