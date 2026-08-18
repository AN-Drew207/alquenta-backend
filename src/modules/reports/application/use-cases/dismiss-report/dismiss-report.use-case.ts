import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../../shared/application/use-case.interface';
import { EntityNotFoundException } from '../../../../../shared/domain/exceptions/entity-not-found.exception';
import { ReportRepository } from '../../../domain/repositories/report.repository';
import { DismissReportCommand } from './dismiss-report.command';

@Injectable()
export class DismissReportUseCase implements UseCase<
  DismissReportCommand,
  void
> {
  constructor(private readonly reportRepository: ReportRepository) {}

  async execute(command: DismissReportCommand): Promise<void> {
    const report = await this.reportRepository.findById(command.reportId);
    if (!report) {
      throw new EntityNotFoundException('Report', command.reportId);
    }

    report.dismiss();
    await this.reportRepository.save(report);
  }
}
