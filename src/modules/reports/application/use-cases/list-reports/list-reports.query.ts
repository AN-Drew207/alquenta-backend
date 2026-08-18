import { ReportStatus } from '../../../domain/enums/report-status.enum';

export class ListReportsQuery {
  /** Omit to get every report regardless of status. */
  constructor(readonly status?: ReportStatus) {}
}
