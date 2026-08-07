import { DomainUnauthorizedException } from '../../../../shared/domain/exceptions/domain-unauthorized.exception';

export class InvalidCredentialsException extends DomainUnauthorizedException {
  constructor() {
    super('Invalid email or password');
  }
}
