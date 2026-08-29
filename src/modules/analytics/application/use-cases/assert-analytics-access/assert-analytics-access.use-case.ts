import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../../shared/application/use-case.interface';
import { UserRepository } from '../../../../auth/domain/repositories/user.repository';
import { PlanRepository } from '../../../../plans/domain/repositories/plan.repository';
import { Plan } from '../../../../plans/domain/entities/plan.entity';
import { PlanTier } from '../../../../plans/domain/enums/plan-tier.enum';
import { AnalyticsAccessDeniedException } from '../../../domain/exceptions/analytics-access-denied.exception';

export interface AssertAnalyticsAccessInput {
  adminId: string;
  /**
   * Defaults to STARTER — Fase 1's gate, kept for the two summary
   * use-cases. Fase 2's per-property/portfolio-depth endpoints (trend,
   * ranking, device breakdown) pass PROFESSIONAL.
   */
  minimumTier?: PlanTier;
}

/**
 * Shared gate for every analytics use-case. Input is the calling admin's id
 * plus the feature's minimum tier; throws AnalyticsAccessDeniedException
 * (403) on failure, resolves to the admin's Plan on success. Callers that
 * only need the gate (Fase 1's summaries, Fase 2's ranking/device
 * breakdown) ignore the return value; GetPropertyAnalyticsTrendUseCase reads
 * plan.tier off it to size its date window.
 */
@Injectable()
export class AssertAnalyticsAccessUseCase implements UseCase<
  AssertAnalyticsAccessInput,
  Plan
> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly planRepository: PlanRepository,
  ) {}

  async execute({
    adminId,
    minimumTier = PlanTier.STARTER,
  }: AssertAnalyticsAccessInput): Promise<Plan> {
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
    if (!plan.meetsMinimumTier(minimumTier)) {
      throw new AnalyticsAccessDeniedException(
        `Your "${plan.name}" plan does not include analytics access`,
      );
    }
    return plan;
  }
}
