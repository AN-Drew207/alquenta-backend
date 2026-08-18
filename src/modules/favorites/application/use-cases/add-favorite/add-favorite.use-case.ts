import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../../shared/application/use-case.interface';
import { EntityNotFoundException } from '../../../../../shared/domain/exceptions/entity-not-found.exception';
import { PropertyRepository } from '../../../../properties/domain/repositories/property.repository';
import { Favorite } from '../../../domain/entities/favorite.entity';
import { FavoriteRepository } from '../../../domain/repositories/favorite.repository';
import { AddFavoriteCommand } from './add-favorite.command';

@Injectable()
export class AddFavoriteUseCase implements UseCase<AddFavoriteCommand, void> {
  constructor(
    private readonly favoriteRepository: FavoriteRepository,
    private readonly propertyRepository: PropertyRepository,
  ) {}

  async execute(command: AddFavoriteCommand): Promise<void> {
    const property = await this.propertyRepository.findById(command.propertyId);
    if (!property) {
      throw new EntityNotFoundException('Property', command.propertyId);
    }

    const favorite = Favorite.create({
      userId: command.userId,
      propertyId: command.propertyId,
    });
    await this.favoriteRepository.add(favorite);
  }
}
