import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../../shared/application/use-case.interface';
import { Role } from '../../../../../shared/domain/role.enum';
import { EntityNotFoundException } from '../../../../../shared/domain/exceptions/entity-not-found.exception';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { SessionRepository } from '../../../domain/repositories/session.repository';
import { DeleteAdminCommand } from './delete-admin.command';

@Injectable()
export class DeleteAdminUseCase implements UseCase<DeleteAdminCommand, void> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: SessionRepository,
  ) {}

  async execute(command: DeleteAdminCommand): Promise<void> {
    const admin = await this.userRepository.findById(command.adminId);
    if (!admin || admin.role !== Role.ADMIN) {
      throw new EntityNotFoundException('Admin', command.adminId);
    }

    await this.sessionRepository.deleteAllForUser(command.adminId);
    await this.userRepository.delete(command.adminId);
  }
}
