import { DomainConflictException } from '../../../../shared/domain/exceptions/domain-conflict.exception';

export class UsernameTakenException extends DomainConflictException {
  constructor(username: string) {
    super(`Username "${username}" is already taken`);
  }
}
