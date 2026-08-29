import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../../shared/application/use-case.interface';
import { Property } from '../../../../properties/domain/entities/property.entity';
import { PropertyRepository } from '../../../../properties/domain/repositories/property.repository';
import { FavoriteRepository } from '../../../domain/repositories/favorite.repository';
import { ListFavoritesQuery } from './list-favorites.query';

@Injectable()
export class ListFavoritesUseCase implements UseCase<
  ListFavoritesQuery,
  Property[]
> {
  constructor(
    private readonly favoriteRepository: FavoriteRepository,
    private readonly propertyRepository: PropertyRepository,
  ) {}

  async execute(query: ListFavoritesQuery): Promise<Property[]> {
    const favorites = await this.favoriteRepository.findByUser(query.userId);
    const properties = await this.propertyRepository.findByIds(
      favorites.map((favorite) => favorite.propertyId),
    );
    const propertiesById = new Map(
      properties.map((property) => [property.id, property]),
    );

    // Re-order to match favorited-most-recently-first (findByIds doesn't
    // preserve input order); silently skips a property that no longer
    // exists rather than erroring the whole list.
    return favorites
      .map((favorite) => propertiesById.get(favorite.propertyId))
      .filter((property): property is Property => property !== undefined);
  }
}
