import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PurgeStaleCancelledPropertiesUseCase } from '../use-cases/purge-stale-cancelled-properties/purge-stale-cancelled-properties.use-case';

@Injectable()
export class CancelledPropertiesCleanupTask {
  private readonly logger = new Logger(CancelledPropertiesCleanupTask.name);

  constructor(
    private readonly purgeStaleCancelledPropertiesUseCase: PurgeStaleCancelledPropertiesUseCase,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleCron(): Promise<void> {
    const deletedCount = await this.purgeStaleCancelledPropertiesUseCase.execute();
    if (deletedCount > 0) {
      this.logger.log(`Purged ${deletedCount} cancelled listing(s) past the retention window`);
    }
  }
}
