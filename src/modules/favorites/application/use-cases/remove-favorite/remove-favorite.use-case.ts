import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../../shared/application/use-case.interface';
import { FavoriteRepository } from '../../../domain/repositories/favorite.repository';
import { RemoveFavoriteCommand } from './remove-favorite.command';

@Injectable()
export class RemoveFavoriteUseCase
  implements UseCase<RemoveFavoriteCommand, void>
{
  constructor(private readonly favoriteRepository: FavoriteRepository) {}

  async execute(command: RemoveFavoriteCommand): Promise<void> {
    await this.favoriteRepository.remove(command.userId, command.propertyId);
  }
}
