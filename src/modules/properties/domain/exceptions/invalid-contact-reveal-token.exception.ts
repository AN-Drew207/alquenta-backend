import { DomainForbiddenException } from '../../../../shared/domain/exceptions/domain-forbidden.exception';

export class InvalidContactRevealTokenException extends DomainForbiddenException {
  constructor() {
    super('This contact reveal token is missing, invalid, or expired.');
  }
}
