import { ReportReason } from '../../../domain/enums/report-reason.enum';

export class CreateReportCommand {
  constructor(
    readonly propertyId: string,
    readonly reporterId: string,
    readonly reason: ReportReason,
    readonly details?: string | null,
  ) {}
}
