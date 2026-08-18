import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../../shared/application/use-case.interface';
import { FavoriteRepository } from '../../../domain/repositories/favorite.repository';
import { ListFavoriteIdsQuery } from './list-favorite-ids.query';

/**
 * Lightweight companion to ListFavoritesUseCase — just the propertyIds, so
 * catalog/detail pages can hydrate heart-icon state without fetching full
 * property payloads a second time.
 */
@Injectable()
export class ListFavoriteIdsUseCase
  implements UseCase<ListFavoriteIdsQuery, string[]>
{
  constructor(private readonly favoriteRepository: FavoriteRepository) {}

  async execute(query: ListFavoriteIdsQuery): Promise<string[]> {
    const favorites = await this.favoriteRepository.findByUser(query.userId);
    return favorites.map((favorite) => favorite.propertyId);
  }
}
