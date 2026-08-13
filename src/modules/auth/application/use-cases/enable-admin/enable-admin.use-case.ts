import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../../shared/application/use-case.interface';
import { Role } from '../../../../../shared/domain/role.enum';
import { EntityNotFoundException } from '../../../../../shared/domain/exceptions/entity-not-found.exception';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { EnableAdminCommand } from './enable-admin.command';

@Injectable()
export class EnableAdminUseCase implements UseCase<EnableAdminCommand, void> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: EnableAdminCommand): Promise<void> {
    const admin = await this.userRepository.findById(command.adminId);
    if (!admin || admin.role !== Role.ADMIN) {
      throw new EntityNotFoundException('Admin', command.adminId);
    }

    admin.reactivate();
    await this.userRepository.save(admin);
  }
}
