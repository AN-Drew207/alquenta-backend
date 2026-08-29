import {
  Prisma,
  Favorite as PrismaFavorite,
} from '../../../../../generated/prisma/client';
import { Favorite } from '../../domain/entities/favorite.entity';

export class FavoriteMapper {
  static toDomain(row: PrismaFavorite): Favorite {
    return Favorite.reconstitute({
      id: row.id,
      userId: row.userId,
      propertyId: row.propertyId,
      createdAt: row.createdAt,
    });
  }

  static toPersistence(
    favorite: Favorite,
  ): Prisma.FavoriteUncheckedCreateInput {
    return {
      id: favorite.id,
      userId: favorite.userId,
      propertyId: favorite.propertyId,
      createdAt: favorite.createdAt,
    };
  }
}
