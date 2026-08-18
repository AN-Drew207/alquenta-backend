import { Controller, Delete, Get, HttpCode, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../../shared/presentation/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../../../shared/domain/authenticated-user.interface';
import { PublicPropertyResponseDto } from '../../../properties/presentation/http/dto/public-property-response.dto';
import { PropertyResponseMapper } from '../../../properties/presentation/http/mappers/property-response.mapper';
import { AddFavoriteUseCase } from '../../application/use-cases/add-favorite/add-favorite.use-case';
import { AddFavoriteCommand } from '../../application/use-cases/add-favorite/add-favorite.command';
import { RemoveFavoriteUseCase } from '../../application/use-cases/remove-favorite/remove-favorite.use-case';
import { RemoveFavoriteCommand } from '../../application/use-cases/remove-favorite/remove-favorite.command';
import { ListFavoritesUseCase } from '../../application/use-cases/list-favorites/list-favorites.use-case';
import { ListFavoritesQuery } from '../../application/use-cases/list-favorites/list-favorites.query';
import { ListFavoriteIdsUseCase } from '../../application/use-cases/list-favorite-ids/list-favorite-ids.use-case';
import { ListFavoriteIdsQuery } from '../../application/use-cases/list-favorite-ids/list-favorite-ids.query';

@ApiTags('favorites')
@Controller('favorites')
export class FavoritesController {
  constructor(
    private readonly addFavoriteUseCase: AddFavoriteUseCase,
    private readonly removeFavoriteUseCase: RemoveFavoriteUseCase,
    private readonly listFavoritesUseCase: ListFavoritesUseCase,
    private readonly listFavoriteIdsUseCase: ListFavoriteIdsUseCase,
  ) {}

  @ApiOperation({ summary: "List the authenticated user's favorited properties" })
  @Get()
  async list(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PublicPropertyResponseDto[]> {
    const properties = await this.listFavoritesUseCase.execute(
      new ListFavoritesQuery(user.id),
    );
    return properties.map((property) =>
      PropertyResponseMapper.toPublicDto(property),
    );
  }

  @ApiOperation({
    summary:
      "Just the property ids the authenticated user favorited — for hydrating heart-icon state elsewhere without refetching full property payloads",
  })
  @Get('ids')
  async listIds(@CurrentUser() user: AuthenticatedUser): Promise<string[]> {
    return this.listFavoriteIdsUseCase.execute(new ListFavoriteIdsQuery(user.id));
  }

  @ApiOperation({ summary: 'Favorite a property (idempotent)' })
  @Post(':propertyId')
  @HttpCode(204)
  async add(
    @Param('propertyId') propertyId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.addFavoriteUseCase.execute(new AddFavoriteCommand(user.id, propertyId));
  }

  @ApiOperation({ summary: 'Unfavorite a property (idempotent)' })
  @Delete(':propertyId')
  @HttpCode(204)
  async remove(
    @Param('propertyId') propertyId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.removeFavoriteUseCase.execute(
      new RemoveFavoriteCommand(user.id, propertyId),
    );
  }
}
