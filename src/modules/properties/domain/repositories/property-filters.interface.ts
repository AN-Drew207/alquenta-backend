import { PropertyType } from '../enums/property-type.enum';
import { PropertyStatus } from '../enums/property-status.enum';

export interface PropertyFilters {
  status?: PropertyStatus;
  type?: PropertyType;
  state?: string;
  municipality?: string;
  adminId?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  parkingSpaces?: number;
}
