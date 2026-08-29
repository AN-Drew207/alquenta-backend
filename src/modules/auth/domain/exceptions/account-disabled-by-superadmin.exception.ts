import { DomainForbiddenException } from '../../../../shared/domain/exceptions/domain-forbidden.exception';

export class AccountDisabledBySuperadminException extends DomainForbiddenException {
  constructor() {
    super(
      'This account was disabled by an administrator. Contact support for help.',
    );
  }
}
