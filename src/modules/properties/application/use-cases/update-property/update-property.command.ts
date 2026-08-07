import { PropertyChanges } from '../../../domain/entities/property.entity';

export class UpdatePropertyCommand {
  constructor(
    readonly propertyId: string,
    readonly adminId: string,
    readonly changes: PropertyChanges,
  ) {}
}
