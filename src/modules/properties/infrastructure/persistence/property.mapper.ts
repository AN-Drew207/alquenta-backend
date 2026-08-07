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
      city: row.city,
      type: row.type as PropertyType,
      operationType: row.operationType as OperationType,
      price: Number(row.price),
      status: row.status as PropertyStatus,
      bedrooms: row.bedrooms,
      bathrooms: row.bathrooms,
      squareMeters: row.squareMeters === null ? null : Number(row.squareMeters),
      images: row.images,
      createdAt: row.createdAt,
    });
  }

  static toPersistence(property: Property): Prisma.PropertyUncheckedCreateInput {
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
