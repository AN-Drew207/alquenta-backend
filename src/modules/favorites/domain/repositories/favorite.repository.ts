import { Favorite } from '../entities/favorite.entity';

export abstract class FavoriteRepository {
  /** Idempotent — a second add() for the same user/property is a no-op. */
  abstract add(favorite: Favorite): Promise<void>;
  /** Idempotent — removing a favorite that doesn't exist is a no-op. */
  abstract remove(userId: string, propertyId: string): Promise<void>;
  abstract findByUser(userId: string): Promise<Favorite[]>;
}
