import { DomainConflictException } from '../../../../shared/domain/exceptions/domain-conflict.exception';

export class ActiveListingsLimitExceededException extends DomainConflictException {
  constructor(planName: string, limit: number) {
    super(
      `Your "${planName}" plan allows up to ${limit} active listing(s). Archive or cancel one before publishing a new one, or upgrade your plan.`,
    );
  }
}
