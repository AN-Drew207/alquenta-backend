import { PropertyType } from '../../../../properties/domain/enums/property-type.enum';
import { OperationType } from '../../../../properties/domain/enums/operation-type.enum';
import { PropertyStatus } from '../../../../properties/domain/enums/property-status.enum';

/**
 * Fase 4 added the optional filters below (type/operationType/state/status
 * narrow WHICH of the admin's properties are included; from/to narrow WHICH
 * analytics events count, by occurredAt) — ENTERPRISE-only, see
 * hasAnyFilter() in GetPortfolioAnalyticsSummaryUseCase. Omitting all of
 * them reproduces Fase 1's behavior exactly, still gated at STARTER+.
 */
export class GetPortfolioAnalyticsSummaryQuery {
  constructor(
    readonly adminId: string,
    readonly type?: PropertyType,
    readonly operationType?: OperationType,
    readonly state?: string,
    readonly status?: PropertyStatus,
    readonly from?: Date,
    readonly to?: Date,
  ) {}
}
