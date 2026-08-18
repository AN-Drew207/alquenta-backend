import { ReportListItem } from '../../../application/use-cases/list-reports/report-list-item';
import { ReportResponseDto } from '../dto/report-response.dto';

export class ReportResponseMapper {
  static toDto(item: ReportListItem): ReportResponseDto {
    return {
      id: item.report.id,
      propertyId: item.report.propertyId,
      propertyTitle: item.propertyTitle,
      reporterEmail: item.reporterEmail,
      reporterName: item.reporterName,
      reason: item.report.reason,
      details: item.report.details,
      status: item.report.status,
      createdAt: item.report.createdAt,
    };
  }
}
