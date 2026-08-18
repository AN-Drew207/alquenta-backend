import {
  Prisma,
  Report as PrismaReport,
} from '../../../../../generated/prisma/client';
import { Report } from '../../domain/entities/report.entity';
import { ReportReason } from '../../domain/enums/report-reason.enum';
import { ReportStatus } from '../../domain/enums/report-status.enum';

export class ReportMapper {
  static toDomain(row: PrismaReport): Report {
    return Report.reconstitute({
      id: row.id,
      propertyId: row.propertyId,
      reporterId: row.reporterId,
      reason: row.reason as ReportReason,
      details: row.details,
      status: row.status as ReportStatus,
      createdAt: row.createdAt,
    });
  }

  static toPersistence(report: Report): Prisma.ReportUncheckedCreateInput {
    return {
      id: report.id,
      propertyId: report.propertyId,
      reporterId: report.reporterId,
      reason: report.reason,
      details: report.details,
      status: report.status,
      createdAt: report.createdAt,
    };
  }
}
