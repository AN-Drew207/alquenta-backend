import { Role } from '../../../../../shared/domain/role.enum';

export class DeletePropertyCommand {
  constructor(
    readonly propertyId: string,
    readonly adminId: string,
    readonly role: Role,
  ) {}
}
