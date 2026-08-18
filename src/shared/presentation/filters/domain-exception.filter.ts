import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { DomainException } from '../../domain/exceptions/domain.exception';
import { DomainNotFoundException } from '../../domain/exceptions/domain-not-found.exception';
import { DomainConflictException } from '../../domain/exceptions/domain-conflict.exception';
import { DomainValidationException } from '../../domain/exceptions/domain-validation.exception';
import { DomainForbiddenException } from '../../domain/exceptions/domain-forbidden.exception';
import { DomainUnauthorizedException } from '../../domain/exceptions/domain-unauthorized.exception';
import { DomainServiceUnavailableException } from '../../domain/exceptions/domain-service-unavailable.exception';

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const status = this.resolveStatus(exception);
    response.status(status).json({
      statusCode: status,
      message: exception.message,
      error: exception.constructor.name,
    });
  }

  private resolveStatus(exception: DomainException): number {
    if (exception instanceof DomainNotFoundException) {
      return HttpStatus.NOT_FOUND;
    }
    if (exception instanceof DomainConflictException) {
      return HttpStatus.CONFLICT;
    }
    if (exception instanceof DomainValidationException) {
      return HttpStatus.BAD_REQUEST;
    }
    if (exception instanceof DomainForbiddenException) {
      return HttpStatus.FORBIDDEN;
    }
    if (exception instanceof DomainUnauthorizedException) {
      return HttpStatus.UNAUTHORIZED;
    }
    if (exception instanceof DomainServiceUnavailableException) {
      return HttpStatus.SERVICE_UNAVAILABLE;
    }
    return HttpStatus.UNPROCESSABLE_ENTITY;
  }
}
