import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../../shared/application/use-case.interface';
import { EntityNotFoundException } from '../../../../../shared/domain/exceptions/entity-not-found.exception';
import { PropertyRepository } from '../../../../properties/domain/repositories/property.repository';
import { Report } from '../../../domain/entities/report.entity';
import { ReportRepository } from '../../../domain/repositories/report.repository';
import { CreateReportCommand } from './create-report.command';

@Injectable()
export class CreateReportUseCase implements UseCase<CreateReportCommand, void> {
  constructor(
    private readonly reportRepository: ReportRepository,
    private readonly propertyRepository: PropertyRepository,
  ) {}

  async execute(command: CreateReportCommand): Promise<void> {
    const property = await this.propertyRepository.findById(command.propertyId);
    if (!property) {
      throw new EntityNotFoundException('Property', command.propertyId);
    }

    const report = Report.create({
      propertyId: command.propertyId,
      reporterId: command.reporterId,
      reason: command.reason,
      details: command.details,
    });
    await this.reportRepository.save(report);
  }
}
