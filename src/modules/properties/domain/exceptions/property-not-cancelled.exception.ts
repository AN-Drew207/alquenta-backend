import { DomainConflictException } from '../../../../shared/domain/exceptions/domain-conflict.exception';

export class PropertyNotCancelledException extends DomainConflictException {
  constructor(propertyId: string) {
    super(
      `Property "${propertyId}" must be cancelled before it can be permanently deleted`,
    );
  }
}