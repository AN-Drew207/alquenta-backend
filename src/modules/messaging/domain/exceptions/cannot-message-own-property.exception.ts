import { BusinessRuleViolationException } from '../../../../shared/domain/exceptions/business-rule-violation.exception';

export class CannotMessageOwnPropertyException extends BusinessRuleViolationException {
  constructor(propertyId: string) {
    super(`Cannot start a conversation on your own property "${propertyId}"`);
  }
}
