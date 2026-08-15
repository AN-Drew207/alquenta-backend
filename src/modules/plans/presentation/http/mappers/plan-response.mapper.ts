import { Plan } from '../../../domain/entities/plan.entity';
import { PlanResponseDto } from '../dto/plan-response.dto';

export class PlanResponseMapper {
  static toDto(plan: Plan): PlanResponseDto {
    return {
      id: plan.id,
      tier: plan.tier,
      name: plan.name,
      monthlyPriceUsd: plan.monthlyPriceUsd,
      activeListingsLimit: plan.activeListingsLimit,
    };
  }
}
