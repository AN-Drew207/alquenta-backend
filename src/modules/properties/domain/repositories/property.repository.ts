import { TransactionContext } from '../../../../shared/domain/transaction/transaction-context';
import { Property } from '../entities/property.entity';
import { PropertyFilters } from './property-filters.interface';

export abstract class PropertyRepository {
  abstract save(property: Property, ctx?: TransactionContext): Promise<void>;
  abstract findById(id: string): Promise<Property | null>;
  abstract findByIds(ids: string[]): Promise<Property[]>;
  abstract findMany(filters: PropertyFilters): Promise<Property[]>;
  abstract countByAdminId(adminId: string): Promise<number>;
  abstract countActiveByAdminId(adminId: string): Promise<number>;
  abstract findCancelledBefore(cutoff: Date): Promise<Property[]>;
  abstract delete(id: string): Promise<void>;
}
