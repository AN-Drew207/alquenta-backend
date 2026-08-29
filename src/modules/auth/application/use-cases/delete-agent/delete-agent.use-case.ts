import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../../shared/application/use-case.interface';
import { Role } from '../../../../../shared/domain/role.enum';
import { EntityNotFoundException } from '../../../../../shared/domain/exceptions/entity-not-found.exception';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { SessionRepository } from '../../../domain/repositories/session.repository';
import { DeleteAgentCommand } from './delete-agent.command';

@Injectable()
export class DeleteAgentUseCase implements UseCase<DeleteAgentCommand, void> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: SessionRepository,
  ) {}

  async execute(command: DeleteAgentCommand): Promise<void> {
    const agent = await this.userRepository.findById(command.agentId);
    if (
      !agent ||
      agent.role !== Role.AGENT ||
      agent.parentAdminId !== command.parentAdminId
    ) {
      throw new EntityNotFoundException('Agent', command.agentId);
    }

    // The agent's properties survive the delete (Property.agentId
    // becomes null via ON DELETE SET NULL) — only attribution is lost.
    await this.sessionRepository.deleteAllForUser(command.agentId);
    await this.userRepository.delete(command.agentId);
  }
}
