import { Role } from '../../../../../shared/domain/role.enum';

export class RegisterCommand {
  constructor(
    readonly email: string,
    readonly password: string,
    readonly name: string,
    readonly role: Role,
    readonly phone?: string,
  ) {}
}
