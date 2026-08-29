import { DomainForbiddenException } from '../../../../shared/domain/exceptions/domain-forbidden.exception';

/**
 * Covers every "you may not see this analytics data" case: a missing/absent
 * plan (fail-closed — see AssertAnalyticsAccessUseCase), a plan tier that
 * doesn't meet the feature's minimum, or a property that isn't owned by the
 * requesting admin.
 */
export class AnalyticsAccessDeniedException extends DomainForbiddenException {
  constructor(message: string) {
    super(message);
  }
}
