import { Plan } from '../entities/plan.entity';
import { PlanTier } from '../enums/plan-tier.enum';

export abstract class PlanRepository {
  abstract findById(id: string): Promise<Plan | null>;
  abstract findByTier(tier: PlanTier): Promise<Plan | null>;
  abstract findAll(): Promise<Plan[]>;
}
