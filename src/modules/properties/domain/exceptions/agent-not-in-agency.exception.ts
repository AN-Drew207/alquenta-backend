import { DomainForbiddenException } from '../../../../shared/domain/exceptions/domain-forbidden.exception';

export class AgentNotInAgencyException extends DomainForbiddenException {
  constructor(agentId: string) {
    super(
      `Agent "${agentId}" does not belong to the authenticated admin's agency`,
    );
  }
}
