import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CheckNoContactsAlertsUseCase } from '../use-cases/check-no-contacts-alerts/check-no-contacts-alerts.use-case';

/**
 * Same @nestjs/schedule wiring as
 * properties/application/tasks/cancelled-properties-cleanup.task.ts.
 * Scheduled at 4am, not 3am (that task's slot), to avoid colliding with it.
 */
@Injectable()
export class NoContactsAlertTask {
  private readonly logger = new Logger(NoContactsAlertTask.name);

  constructor(
    private readonly checkNoContactsAlertsUseCase: CheckNoContactsAlertsUseCase,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async handleCron(): Promise<void> {
    const createdCount = await this.checkNoContactsAlertsUseCase.execute();
    if (createdCount > 0) {
      this.logger.log(
        `Created ${createdCount} "no contacts" analytics alert notification(s)`,
      );
    }
  }
}
