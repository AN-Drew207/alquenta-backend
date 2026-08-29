import { PropertyChanges } from '../../../domain/entities/property.entity';
import { Role } from '../../../../../shared/domain/role.enum';

export class UpdatePropertyCommand {
  constructor(
    readonly propertyId: string,
    readonly adminId: string,
    readonly changes: PropertyChanges,
    readonly role: Role,
  ) {}
}
