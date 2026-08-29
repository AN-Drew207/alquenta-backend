import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PlansModule } from '../plans/plans.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PropertyRepository } from '../properties/domain/repositories/property.repository';
import { PrismaPropertyRepository } from '../properties/infrastructure/persistence/prisma-property.repository';
import { PropertyAnalyticsEventRepository } from './domain/repositories/property-analytics-event.repository';
import { PrismaPropertyAnalyticsEventRepository } from './infrastructure/persistence/prisma-property-analytics-event.repository';
import { DeviceTypeParser } from './infrastructure/parsing/device-type.parser';
import { AssertAnalyticsAccessUseCase } from './application/use-cases/assert-analytics-access/assert-analytics-access.use-case';
import { RecordAnalyticsEventUseCase } from './application/use-cases/record-analytics-event/record-analytics-event.use-case';
import { RecordPropertyViewUseCase } from './application/use-cases/record-property-view/record-property-view.use-case';
import { GetPropertyAnalyticsSummaryUseCase } from './application/use-cases/get-property-analytics-summary/get-property-analytics-summary.use-case';
import { GetPortfolioAnalyticsSummaryUseCase } from './application/use-cases/get-portfolio-analytics-summary/get-portfolio-analytics-summary.use-case';
import { GetPropertyAnalyticsTrendUseCase } from './application/use-cases/get-property-analytics-trend/get-property-analytics-trend.use-case';
import { GetPropertyAnalyticsRankingUseCase } from './application/use-cases/get-property-analytics-ranking/get-property-analytics-ranking.use-case';
import { GetPropertyAnalyticsDeviceBreakdownUseCase } from './application/use-cases/get-property-analytics-device-breakdown/get-property-analytics-device-breakdown.use-case';
import { GetPropertyAnalyticsBenchmarkUseCase } from './application/use-cases/get-property-analytics-benchmark/get-property-analytics-benchmark.use-case';
import { GetPropertyAnalyticsExportDataUseCase } from './application/use-cases/get-property-analytics-export-data/get-property-analytics-export-data.use-case';
import { CheckNoContactsAlertsUseCase } from './application/use-cases/check-no-contacts-alerts/check-no-contacts-alerts.use-case';
import { NoContactsAlertTask } from './application/tasks/no-contacts-alert.task';
import { PropertyAnalyticsCsvSerializer } from './presentation/http/serializers/property-analytics-csv.serializer';
import { PropertyAnalyticsPdfSerializer } from './presentation/http/serializers/property-analytics-pdf.serializer';
import { AnalyticsController } from './presentation/http/analytics.controller';

@Module({
  // Deliberately AuthModule + PlansModule only, NOT PropertiesModule:
  // properties/messaging import AnalyticsModule for instrumentation, so
  // importing PropertiesModule back here would cycle. PropertyRepository
  // is instead re-provided locally below — same pattern properties.module.ts
  // already uses for itself (a second stateless wrapper over the @Global()
  // PrismaService is harmless).
  imports: [AuthModule, PlansModule, NotificationsModule],
  controllers: [AnalyticsController],
  providers: [
    { provide: PropertyRepository, useClass: PrismaPropertyRepository },
    {
      provide: PropertyAnalyticsEventRepository,
      useClass: PrismaPropertyAnalyticsEventRepository,
    },
    DeviceTypeParser,
    AssertAnalyticsAccessUseCase,
    RecordAnalyticsEventUseCase,
    RecordPropertyViewUseCase,
    GetPropertyAnalyticsSummaryUseCase,
    GetPortfolioAnalyticsSummaryUseCase,
    GetPropertyAnalyticsTrendUseCase,
    GetPropertyAnalyticsRankingUseCase,
    GetPropertyAnalyticsDeviceBreakdownUseCase,
    GetPropertyAnalyticsBenchmarkUseCase,
    GetPropertyAnalyticsExportDataUseCase,
    CheckNoContactsAlertsUseCase,
    NoContactsAlertTask,
    PropertyAnalyticsCsvSerializer,
    PropertyAnalyticsPdfSerializer,
  ],
  // RecordAnalyticsEventUseCase is the one-line instrumentation hook
  // consumed by properties (reveal-contact) and messaging (start-conversation).
  exports: [RecordAnalyticsEventUseCase],
})
export class AnalyticsModule {}
