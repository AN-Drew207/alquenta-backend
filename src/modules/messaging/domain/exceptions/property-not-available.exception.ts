import { BusinessRuleViolationException } from '../../../../shared/domain/exceptions/business-rule-violation.exception';

export class PropertyNotAvailableException extends BusinessRuleViolationException {
  constructor(propertyId: string) {
    super(`Property "${propertyId}" is not available for contact`);
  }
}
