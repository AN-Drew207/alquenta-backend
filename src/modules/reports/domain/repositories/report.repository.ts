import { Report } from '../entities/report.entity';
import { ReportStatus } from '../enums/report-status.enum';

export abstract class ReportRepository {
  abstract save(report: Report): Promise<void>;
  abstract findById(id: string): Promise<Report | null>;
  /** Omit status to get every report regardless of status. */
  abstract findMany(status?: ReportStatus): Promise<Report[]>;
}
