import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { Plan } from '../../domain/entities/plan.entity';
import { PlanRepository } from '../../domain/repositories/plan.repository';
import { PlanTier } from '../../domain/enums/plan-tier.enum';
import { PlanMapper } from './plan.mapper';

@Injectable()
export class PrismaPlanRepository implements PlanRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Plan | null> {
    const row = await this.prisma.plan.findUnique({ where: { id } });
    return row ? PlanMapper.toDomain(row) : null;
  }

  async findByTier(tier: PlanTier): Promise<Plan | null> {
    const row = await this.prisma.plan.findUnique({ where: { tier } });
    return row ? PlanMapper.toDomain(row) : null;
  }

  async findAll(): Promise<Plan[]> {
    const rows = await this.prisma.plan.findMany({
      orderBy: { monthlyPriceUsd: 'asc' },
    });
    return rows.map(PlanMapper.toDomain);
  }
}
