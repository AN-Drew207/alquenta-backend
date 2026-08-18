import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PlansModule } from '../plans/plans.module';
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
import { AnalyticsController } from './presentation/http/analytics.controller';

@Module({
  // Deliberately AuthModule + PlansModule only, NOT PropertiesModule:
  // properties/messaging import AnalyticsModule for instrumentation, so
  // importing PropertiesModule back here would cycle. PropertyRepository
  // is instead re-provided locally below — same pattern properties.module.ts
  // already uses for itself (a second stateless wrapper over the @Global()
  // PrismaService is harmless).
  imports: [AuthModule, PlansModule],
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
  ],
  // RecordAnalyticsEventUseCase is the one-line instrumentation hook
  // consumed by properties (reveal-contact) and messaging (start-conversation).
  exports: [RecordAnalyticsEventUseCase],
})
export class AnalyticsModule {}
