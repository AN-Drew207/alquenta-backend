import { PropertyType } from '../enums/property-type.enum';
import { PropertyStatus } from '../enums/property-status.enum';

export interface PropertyFilters {
  status?: PropertyStatus;
  type?: PropertyType;
  city?: string;
  adminId?: string;
}
