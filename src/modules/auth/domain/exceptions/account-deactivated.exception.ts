import { DomainForbiddenException } from '../../../../shared/domain/exceptions/domain-forbidden.exception';

export class AccountDeactivatedException extends DomainForbiddenException {
  constructor() {
    super('This account is deactivated. Reactivate it to continue.');
  }
}
