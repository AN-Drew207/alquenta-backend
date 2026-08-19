import { Injectable, Logger } from '@nestjs/common';
import { UseCase } from '../../../../../shared/application/use-case.interface';
import { Role } from '../../../../../shared/domain/role.enum';
import { PropertyRepository } from '../../../../properties/domain/repositories/property.repository';
import { PropertyStatus } from '../../../../properties/domain/enums/property-status.enum';
import { UserRepository } from '../../../../auth/domain/repositories/user.repository';
import { PlanRepository } from '../../../../plans/domain/repositories/plan.repository';
import { PlanTier } from '../../../../plans/domain/enums/plan-tier.enum';
import { NotificationRepository } from '../../../../notifications/domain/repositories/notification.repository';
import { Notification } from '../../../../notifications/domain/entities/notification.entity';
import { NotificationType } from '../../../../notifications/domain/enums/notification-type.enum';
import { SendNotificationEmailUseCase } from '../../../../notifications/application/use-cases/send-notification-email/send-notification-email.use-case';
import { PropertyAnalyticsEventRepository } from '../../../domain/repositories/property-analytics-event.repository';

const NO_CONTACTS_WINDOW_DAYS = 14;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Scheduled by NoContactsAlertTask (@Cron, 4am daily). For every AVAILABLE
 * property whose admin has a BUSINESS+ plan, if the property has had zero
 * contact events (WHATSAPP_REVEAL + MESSAGE_STARTED) in the last 14 days
 * AND no ANALYTICS_ALERT notification was already created for it in that
 * same window (dedup — see NotificationRepository.existsRecentByPropertyAndType),
 * creates one via the exact same Notification.create() + repository.save()
 * pattern StartConversationUseCase/ReplyToConversationUseCase already use
 * (CreateNotificationUseCase is unused elsewhere in this codebase, so this
 * follows the pattern that's actually established, not the vestigial one).
 *
 * Admin/plan lookups are batched (findManyByRole + planRepository.findAll(),
 * both bounded by the total admin/plan count, not the property count) so
 * the only per-property work is the two small queries every property in the
 * eligible set genuinely needs — same O(n)-is-fine-at-this-scale trade-off
 * already accepted elsewhere (see messaging's response-stats endpoint).
 */
@Injectable()
export class CheckNoContactsAlertsUseCase implements UseCase<void, number> {
  private readonly logger = new Logger(CheckNoContactsAlertsUseCase.name);

  constructor(
    private readonly propertyRepository: PropertyRepository,
    private readonly userRepository: UserRepository,
    private readonly planRepository: PlanRepository,
    private readonly notificationRepository: NotificationRepository,
    private readonly sendNotificationEmailUseCase: SendNotificationEmailUseCase,
    private readonly analyticsEventRepository: PropertyAnalyticsEventRepository,
  ) {}

  async execute(): Promise<number> {
    const properties = await this.propertyRepository.findMany({
      status: PropertyStatus.AVAILABLE,
    });
    if (properties.length === 0) return 0;

    const eligibleAdminIds = await this.resolveEligibleAdminIds();
    if (eligibleAdminIds.size === 0) return 0;

    const eligibleProperties = properties.filter((property) =>
      eligibleAdminIds.has(property.adminId),
    );
    if (eligibleProperties.length === 0) return 0;

    const since = new Date(Date.now() - NO_CONTACTS_WINDOW_DAYS * MS_PER_DAY);
    let createdCount = 0;

    for (const property of eligibleProperties) {
      const recentContacts =
        await this.analyticsEventRepository.countContactEventsSince(
          property.id,
          since,
        );
      if (recentContacts > 0) continue;

      const alreadyAlerted =
        await this.notificationRepository.existsRecentByPropertyAndType(
          property.id,
          NotificationType.ANALYTICS_ALERT,
          since,
        );
      if (alreadyAlerted) continue;

      const notification = Notification.create({
        recipientUserId: property.adminId,
        type: NotificationType.ANALYTICS_ALERT,
        text: `Tu propiedad "${property.title}" no ha recibido contactos en los últimos ${NO_CONTACTS_WINDOW_DAYS} días`,
        propertyId: property.id,
      });
      await this.notificationRepository.save(notification);
      createdCount++;

      try {
        await this.sendNotificationEmailUseCase.execute(notification);
      } catch (error) {
        this.logger.error(
          'Failed to send analytics alert notification email',
          error as Error,
        );
      }
    }

    return createdCount;
  }

  /** Admins with an assigned BUSINESS+ plan — batched, not per-property. */
  private async resolveEligibleAdminIds(): Promise<Set<string>> {
    const [admins, plans] = await Promise.all([
      this.userRepository.findManyByRole(Role.ADMIN),
      this.planRepository.findAll(),
    ]);
    const plansById = new Map(plans.map((plan) => [plan.id, plan]));

    const eligibleAdminIds = new Set<string>();
    for (const admin of admins) {
      if (!admin.planId) continue;
      const plan = plansById.get(admin.planId);
      if (plan?.meetsMinimumTier(PlanTier.BUSINESS)) {
        eligibleAdminIds.add(admin.id);
      }
    }
    return eligibleAdminIds;
  }
}
