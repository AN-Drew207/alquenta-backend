import { DomainValidationException } from '../../../../shared/domain/exceptions/domain-validation.exception';

export class InvalidPriceException extends DomainValidationException {
  constructor() {
    super('The property price must be greater than zero');
  }
}
