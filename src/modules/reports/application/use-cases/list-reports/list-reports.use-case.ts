import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../../shared/application/use-case.interface';
import { PropertyRepository } from '../../../../properties/domain/repositories/property.repository';
import { UserRepository } from '../../../../auth/domain/repositories/user.repository';
import { ReportRepository } from '../../../domain/repositories/report.repository';
import { ListReportsQuery } from './list-reports.query';
import { ReportListItem } from './report-list-item';

@Injectable()
export class ListReportsUseCase implements UseCase<
  ListReportsQuery,
  ReportListItem[]
> {
  constructor(
    private readonly reportRepository: ReportRepository,
    private readonly propertyRepository: PropertyRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(query: ListReportsQuery): Promise<ReportListItem[]> {
    const reports = await this.reportRepository.findMany(query.status);
    if (reports.length === 0) return [];

    const properties = await this.propertyRepository.findByIds(
      reports.map((report) => report.propertyId),
    );
    const propertiesById = new Map(
      properties.map((property) => [property.id, property]),
    );

    const uniqueReporterIds = [
      ...new Set(reports.map((report) => report.reporterId)),
    ];
    const reporters = await Promise.all(
      uniqueReporterIds.map((id) => this.userRepository.findById(id)),
    );
    const reportersById = new Map(
      reporters.filter((user) => user !== null).map((user) => [user.id, user]),
    );

    return reports
      .map((report) => {
        const property = propertiesById.get(report.propertyId);
        const reporter = reportersById.get(report.reporterId);
        // Cascade deletes mean this shouldn't happen in practice, but skip
        // rather than throw if the property/reporter is somehow gone.
        if (!property || !reporter) return null;
        return new ReportListItem(
          report,
          property.title,
          reporter.email,
          reporter.name,
        );
      })
      .filter((item): item is ReportListItem => item !== null);
  }
}
