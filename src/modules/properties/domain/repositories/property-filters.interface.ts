import { PropertyType } from '../enums/property-type.enum';
import { PropertyStatus } from '../enums/property-status.enum';
import { OperationType } from '../enums/operation-type.enum';

export type PropertySortBy = 'price' | 'createdAt' | 'squareMeters';
export type SortOrder = 'asc' | 'desc';

export interface PropertyFilters {
  status?: PropertyStatus;
  type?: PropertyType;
  operationType?: OperationType;
  state?: string;
  municipality?: string;
  adminId?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  parkingSpaces?: number;
  /** Case-insensitive substring match against the property title. */
  search?: string;
  /** Defaults to createdAt/desc (newest first) when omitted. */
  sortBy?: PropertySortBy;
  sortOrder?: SortOrder;
}
