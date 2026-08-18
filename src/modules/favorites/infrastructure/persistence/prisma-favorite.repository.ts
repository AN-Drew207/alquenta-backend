import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { Favorite } from '../../domain/entities/favorite.entity';
import { FavoriteRepository } from '../../domain/repositories/favorite.repository';
import { FavoriteMapper } from './favorite.mapper';

@Injectable()
export class PrismaFavoriteRepository implements FavoriteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async add(favorite: Favorite): Promise<void> {
    const data = FavoriteMapper.toPersistence(favorite);
    await this.prisma.favorite.upsert({
      where: {
        userId_propertyId: {
          userId: favorite.userId,
          propertyId: favorite.propertyId,
        },
      },
      create: data,
      update: {},
    });
  }

  async remove(userId: string, propertyId: string): Promise<void> {
    await this.prisma.favorite.deleteMany({ where: { userId, propertyId } });
  }

  async findByUser(userId: string): Promise<Favorite[]> {
    const rows = await this.prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => FavoriteMapper.toDomain(row));
  }
}
