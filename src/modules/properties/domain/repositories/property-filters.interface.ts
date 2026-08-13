import { PropertyType } from '../enums/property-type.enum';
import { PropertyStatus } from '../enums/property-status.enum';
import { OperationType } from '../enums/operation-type.enum';

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
}
