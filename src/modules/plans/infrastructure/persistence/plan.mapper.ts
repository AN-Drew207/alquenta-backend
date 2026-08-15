import { Plan as PrismaPlan } from '../../../../../generated/prisma/client';
import { Plan } from '../../domain/entities/plan.entity';
import { PlanTier } from '../../domain/enums/plan-tier.enum';

export class PlanMapper {
  static toDomain(row: PrismaPlan): Plan {
    return Plan.reconstitute({
      id: row.id,
      tier: row.tier as PlanTier,
      name: row.name,
      monthlyPriceUsd: Number(row.monthlyPriceUsd),
      activeListingsLimit: row.activeListingsLimit,
      createdAt: row.createdAt,
    });
  }
}
