import { DomainForbiddenException } from '../../../shared/domain/exceptions/domain-forbidden.exception';

export class AdminRequiredForPropertyMediaException extends DomainForbiddenException {
  constructor() {
    super('Only admins and agents can upload property media');
  }
}
