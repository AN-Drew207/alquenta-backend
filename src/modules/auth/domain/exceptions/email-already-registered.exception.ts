import { DomainConflictException } from '../../../../shared/domain/exceptions/domain-conflict.exception';

export class EmailAlreadyRegisteredException extends DomainConflictException {
  constructor(email: string) {
    super(`An account with email "${email}" is already registered`);
  }
}
