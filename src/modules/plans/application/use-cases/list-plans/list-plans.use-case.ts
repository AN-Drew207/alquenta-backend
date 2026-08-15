import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../../shared/application/use-case.interface';
import { Plan } from '../../../domain/entities/plan.entity';
import { PlanRepository } from '../../../domain/repositories/plan.repository';

@Injectable()
export class ListPlansUseCase implements UseCase<void, Plan[]> {
  constructor(private readonly planRepository: PlanRepository) {}

  async execute(): Promise<Plan[]> {
    return this.planRepository.findAll();
  }
}
