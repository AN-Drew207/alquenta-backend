import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../../shared/application/use-case.interface';
import { UserRepository } from '../../../../auth/domain/repositories/user.repository';
import { PlanRepository } from '../../../../plans/domain/repositories/plan.repository';
import { PlanTier } from '../../../../plans/domain/enums/plan-tier.enum';
import { AnalyticsAccessDeniedException } from '../../../domain/exceptions/analytics-access-denied.exception';

/**
 * Shared gate for both summary use-cases. Input is the calling admin's id;
 * throws AnalyticsAccessDeniedException (403) and resolves to void on
 * success.
 */
@Injectable()
export class AssertAnalyticsAccessUseCase implements UseCase<string, void> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly planRepository: PlanRepository,
  ) {}

  async execute(adminId: string): Promise<void> {
    const admin = await this.userRepository.findById(adminId);
    const plan = admin?.planId
      ? await this.planRepository.findById(admin.planId)
      : null;

    // Unlike PublishPropertyUseCase.assertWithinActiveListingsLimit(), a
    // missing plan is NOT treated as unlimited/free access here — every
    // invited admin is assigned a tier, so a null plan is a data anomaly,
    // not a legitimate free tier. Fail closed.
    if (!plan) {
      throw new AnalyticsAccessDeniedException(
        'Analytics access requires an assigned subscription plan',
      );
    }
    if (!plan.meetsMinimumTier(PlanTier.STARTER)) {
      throw new AnalyticsAccessDeniedException(
        `Your "${plan.name}" plan does not include analytics access`,
      );
    }
  }
}
