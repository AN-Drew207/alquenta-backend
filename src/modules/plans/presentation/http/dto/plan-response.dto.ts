import { ApiProperty } from '@nestjs/swagger';
import { PlanTier } from '../../../domain/enums/plan-tier.enum';

export class PlanResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: PlanTier })
  tier: PlanTier;

  @ApiProperty()
  name: string;

  @ApiProperty()
  monthlyPriceUsd: number;

  @ApiProperty({ nullable: true, description: 'null means unlimited' })
  activeListingsLimit: number | null;
}
