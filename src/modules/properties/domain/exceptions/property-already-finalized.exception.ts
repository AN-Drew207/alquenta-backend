import { BusinessRuleViolationException } from '../../../../shared/domain/exceptions/business-rule-violation.exception';

export class PropertyAlreadyFinalizedException extends BusinessRuleViolationException {
  constructor(propertyId: string) {
    super(
      `Property "${propertyId}" is already rented/sold and can no longer be changed`,
    );
  }
}
