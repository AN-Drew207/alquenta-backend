import { Module } from '@nestjs/common';
import { PropertiesModule } from '../properties/properties.module';
import { AuthModule } from '../auth/auth.module';
import { ReportRepository } from './domain/repositories/report.repository';
import { PrismaReportRepository } from './infrastructure/persistence/prisma-report.repository';
import { CreateReportUseCase } from './application/use-cases/create-report/create-report.use-case';
import { ListReportsUseCase } from './application/use-cases/list-reports/list-reports.use-case';
import { DismissReportUseCase } from './application/use-cases/dismiss-report/dismiss-report.use-case';
import { ReportsController } from './presentation/http/reports.controller';

@Module({
  imports: [PropertiesModule, AuthModule],
  controllers: [ReportsController],
  providers: [
    { provide: ReportRepository, useClass: PrismaReportRepository },
    CreateReportUseCase,
    ListReportsUseCase,
    DismissReportUseCase,
  ],
})
export class ReportsModule {}
