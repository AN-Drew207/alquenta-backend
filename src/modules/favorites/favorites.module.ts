import { Module } from '@nestjs/common';
import { PropertiesModule } from '../properties/properties.module';
import { FavoriteRepository } from './domain/repositories/favorite.repository';
import { PrismaFavoriteRepository } from './infrastructure/persistence/prisma-favorite.repository';
import { AddFavoriteUseCase } from './application/use-cases/add-favorite/add-favorite.use-case';
import { RemoveFavoriteUseCase } from './application/use-cases/remove-favorite/remove-favorite.use-case';
import { ListFavoritesUseCase } from './application/use-cases/list-favorites/list-favorites.use-case';
import { ListFavoriteIdsUseCase } from './application/use-cases/list-favorite-ids/list-favorite-ids.use-case';
import { FavoritesController } from './presentation/http/favorites.controller';

@Module({
  imports: [PropertiesModule],
  controllers: [FavoritesController],
  providers: [
    { provide: FavoriteRepository, useClass: PrismaFavoriteRepository },
    AddFavoriteUseCase,
    RemoveFavoriteUseCase,
    ListFavoritesUseCase,
    ListFavoriteIdsUseCase,
  ],
})
export class FavoritesModule {}
