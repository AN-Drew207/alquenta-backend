import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../../shared/application/use-case.interface';
import { Role } from '../../../../../shared/domain/role.enum';
import { EntityNotFoundException } from '../../../../../shared/domain/exceptions/entity-not-found.exception';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { SessionRepository } from '../../../domain/repositories/session.repository';
import { DisableAgentCommand } from './disable-agent.command';

@Injectable()
export class DisableAgentUseCase implements UseCase<DisableAgentCommand, void> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: SessionRepository,
  ) {}

  async execute(command: DisableAgentCommand): Promise<void> {
    const agent = await this.userRepository.findById(command.agentId);
    if (
      !agent ||
      agent.role !== Role.AGENT ||
      agent.parentAdminId !== command.parentAdminId
    ) {
      throw new EntityNotFoundException('Agent', command.agentId);
    }

    agent.deactivate(true);
    await this.userRepository.save(agent);
    await this.sessionRepository.deleteAllForUser(command.agentId);
  }
}
