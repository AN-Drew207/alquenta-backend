import { DomainValidationException } from '../../../../shared/domain/exceptions/domain-validation.exception';

export class InvalidVerificationTokenException extends DomainValidationException {
  constructor(message = 'This confirmation link is invalid or expired.') {
    super(message);
  }
}
