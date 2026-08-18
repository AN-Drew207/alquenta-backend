import { DomainForbiddenException } from '../../../../shared/domain/exceptions/domain-forbidden.exception';

export class PropertyNotOwnedByAdminException extends DomainForbiddenException {
  constructor(propertyId: string) {
    super(
      `Property "${propertyId}" does not belong to the authenticated admin`,
    );
  }
}
