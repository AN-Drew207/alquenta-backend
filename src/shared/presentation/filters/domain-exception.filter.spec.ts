import { ArgumentsHost, HttpStatus } from '@nestjs/common';
import { DomainException } from '../../domain/exceptions/domain.exception';
import { DomainNotFoundException } from '../../domain/exceptions/domain-not-found.exception';
import { DomainConflictException } from '../../domain/exceptions/domain-conflict.exception';
import { DomainValidationException } from '../../domain/exceptions/domain-validation.exception';
import { DomainForbiddenException } from '../../domain/exceptions/domain-forbidden.exception';
import { DomainUnauthorizedException } from '../../domain/exceptions/domain-unauthorized.exception';
import { BusinessRuleViolationException } from '../../domain/exceptions/business-rule-violation.exception';
import { DomainExceptionFilter } from './domain-exception.filter';

class TestNotFound extends DomainNotFoundException {}
class TestConflict extends DomainConflictException {}
class TestValidation extends DomainValidationException {}
class TestForbidden extends DomainForbiddenException {}
class TestUnauthorized extends DomainUnauthorizedException {}
class TestBusinessRule extends BusinessRuleViolationException {}
class TestUncategorized extends DomainException {}

function createHost() {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  const host = {
    switchToHttp: () => ({
      getResponse: () => ({ status }),
    }),
  } as unknown as ArgumentsHost;
  return { host, status, json };
}

describe('DomainExceptionFilter', () => {
  const filter = new DomainExceptionFilter();

  it.each([
    [new TestNotFound('x'), HttpStatus.NOT_FOUND],
    [new TestConflict('x'), HttpStatus.CONFLICT],
    [new TestValidation('x'), HttpStatus.BAD_REQUEST],
    [new TestForbidden('x'), HttpStatus.FORBIDDEN],
    [new TestUnauthorized('x'), HttpStatus.UNAUTHORIZED],
    [new TestBusinessRule('x'), HttpStatus.UNPROCESSABLE_ENTITY],
    [new TestUncategorized('x'), HttpStatus.UNPROCESSABLE_ENTITY],
  ])('maps %p to status %i', (exception, expectedStatus) => {
    const { host, status, json } = createHost();

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(expectedStatus);
    expect(json).toHaveBeenCalledWith({
      statusCode: expectedStatus,
      message: exception.message,
      error: exception.constructor.name,
    });
  });
});
