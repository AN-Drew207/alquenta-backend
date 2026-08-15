import { Module } from '@nestjs/common';
import { PlanRepository } from './domain/repositories/plan.repository';
import { PrismaPlanRepository } from './infrastructure/persistence/prisma-plan.repository';
import { ListPlansUseCase } from './application/use-cases/list-plans/list-plans.use-case';
import { PlansController } from './presentation/http/plans.controller';

@Module({
  controllers: [PlansController],
  providers: [
    { provide: PlanRepository, useClass: PrismaPlanRepository },
    ListPlansUseCase,
  ],
  exports: [PlanRepository],
})
export class PlansModule {}
