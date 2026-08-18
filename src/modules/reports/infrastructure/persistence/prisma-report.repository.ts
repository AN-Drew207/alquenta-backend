import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { Report } from '../../domain/entities/report.entity';
import { ReportRepository } from '../../domain/repositories/report.repository';
import { ReportStatus } from '../../domain/enums/report-status.enum';
import { ReportMapper } from './report.mapper';

@Injectable()
export class PrismaReportRepository implements ReportRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(report: Report): Promise<void> {
    const data = ReportMapper.toPersistence(report);
    await this.prisma.report.upsert({
      where: { id: data.id },
      create: data,
      update: data,
    });
  }

  async findById(id: string): Promise<Report | null> {
    const row = await this.prisma.report.findUnique({ where: { id } });
    return row ? ReportMapper.toDomain(row) : null;
  }

  async findMany(status?: ReportStatus): Promise<Report[]> {
    const rows = await this.prisma.report.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => ReportMapper.toDomain(row));
  }
}
