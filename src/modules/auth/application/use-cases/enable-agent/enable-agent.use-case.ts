import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../../shared/application/use-case.interface';
import { Role } from '../../../../../shared/domain/role.enum';
import { EntityNotFoundException } from '../../../../../shared/domain/exceptions/entity-not-found.exception';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { EnableAgentCommand } from './enable-agent.command';

@Injectable()
export class EnableAgentUseCase implements UseCase<EnableAgentCommand, void> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: EnableAgentCommand): Promise<void> {
    const agent = await this.userRepository.findById(command.agentId);
    if (
      !agent ||
      agent.role !== Role.AGENT ||
      agent.parentAdminId !== command.parentAdminId
    ) {
      throw new EntityNotFoundException('Agent', command.agentId);
    }

    agent.reactivate();
    await this.userRepository.save(agent);
  }
}
