import { DomainValidationException } from '../../../../shared/domain/exceptions/domain-validation.exception';

export class InvalidAccountConfirmationException extends DomainValidationException {
  constructor() {
    super('The confirmation text does not match your username or email.');
  }
}
