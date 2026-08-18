import { DomainForbiddenException } from '../../../shared/domain/exceptions/domain-forbidden.exception';

export class AdminRequiredForPropertyMediaException extends DomainForbiddenException {
  constructor() {
    super('Only admins can upload property media');
  }
}
