import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../../../generated/prisma/client';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { TransactionContext } from '../../../../shared/domain/transaction/transaction-context';
import { Property } from '../../domain/entities/property.entity';
import { PropertyStatus } from '../../domain/enums/property-status.enum';
import { PropertyRepository } from '../../domain/repositories/property.repository';
import { PropertyFilters } from '../../domain/repositories/property-filters.interface';
import { PropertyMapper } from './property.mapper';

@Injectable()
export class PrismaPropertyRepository implements PropertyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(property: Property, ctx?: TransactionContext): Promise<void> {
    const client = (ctx as Prisma.TransactionClient | undefined) ?? this.prisma;
    const data = PropertyMapper.toPersistence(property);
    await client.property.upsert({
      where: { id: data.id },
      create: data,
      update: data,
    });
  }

  async findById(id: string): Promise<Property | null> {
    const row = await this.prisma.property.findUnique({ where: { id } });
    return row ? PropertyMapper.toDomain(row) : null;
  }

  async findByIds(ids: string[]): Promise<Property[]> {
    if (ids.length === 0) return [];
    const rows = await this.prisma.property.findMany({
      where: { id: { in: ids } },
    });
    return rows.map(PropertyMapper.toDomain);
  }

  async findMany(filters: PropertyFilters): Promise<Property[]> {
    const hasPriceRange =
      filters.minPrice !== undefined || filters.maxPrice !== undefined;

    const rows = await this.prisma.property.findMany({
      where: {
        ...(filters.status && { status: filters.status }),
        ...(filters.type && { type: filters.type }),
        ...(filters.operationType && { operationType: filters.operationType }),
        ...(filters.state && { state: filters.state }),
        ...(filters.municipality && { municipality: filters.municipality }),
        ...(filters.adminId && { adminId: filters.adminId }),
        ...(hasPriceRange && {
          price: {
            ...(filters.minPrice !== undefined && { gte: filters.minPrice }),
            ...(filters.maxPrice !== undefined && { lte: filters.maxPrice }),
          },
        }),
        ...(filters.bedrooms !== undefined && { bedrooms: { gte: filters.bedrooms } }),
        ...(filters.bathrooms !== undefined && { bathrooms: { gte: filters.bathrooms } }),
        ...(filters.parkingSpaces !== undefined && {
          parkingSpaces: { gte: filters.parkingSpaces },
        }),
        ...(filters.search && {
          title: { contains: filters.search, mode: 'insensitive' },
        }),
      },
      orderBy: {
        [filters.sortBy ?? 'createdAt']: filters.sortOrder ?? 'desc',
      },
    });
    return rows.map(PropertyMapper.toDomain);
  }

  async countByAdminId(adminId: string): Promise<number> {
    return this.prisma.property.count({ where: { adminId } });
  }

  async countActiveByAdminId(adminId: string): Promise<number> {
    return this.prisma.property.count({
      where: { adminId, status: PropertyStatus.AVAILABLE },
    });
  }

  async findCancelledBefore(cutoff: Date): Promise<Property[]> {
    const rows = await this.prisma.property.findMany({
      where: {
        status: PropertyStatus.CANCELLED,
        cancelledAt: { lt: cutoff },
      },
    });
    return rows.map(PropertyMapper.toDomain);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.property.delete({ where: { id } });
  }
}
