import { DomainValidationException } from '../../../../shared/domain/exceptions/domain-validation.exception';

export class InvalidOfferAmountException extends DomainValidationException {
  constructor() {
    super('The offer amount must be greater than zero');
  }
}
