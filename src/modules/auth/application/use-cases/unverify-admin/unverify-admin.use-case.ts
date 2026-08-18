import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../../shared/application/use-case.interface';
import { Role } from '../../../../../shared/domain/role.enum';
import { EntityNotFoundException } from '../../../../../shared/domain/exceptions/entity-not-found.exception';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { UnverifyAdminCommand } from './unverify-admin.command';

@Injectable()
export class UnverifyAdminUseCase
  implements UseCase<UnverifyAdminCommand, void>
{
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: UnverifyAdminCommand): Promise<void> {
    const admin = await this.userRepository.findById(command.adminId);
    if (!admin || admin.role !== Role.ADMIN) {
      throw new EntityNotFoundException('Admin', command.adminId);
    }

    admin.unverify();
    await this.userRepository.save(admin);
  }
}
