import { Report } from '../../../domain/entities/report.entity';

/** Report plus the denormalized bits a moderation queue actually needs to show. */
export class ReportListItem {
  constructor(
    readonly report: Report,
    readonly propertyTitle: string,
    readonly reporterEmail: string,
    readonly reporterName: string,
  ) {}
}
