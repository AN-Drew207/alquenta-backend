import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../../shared/application/use-case.interface';
import { EntityNotFoundException } from '../../../../../shared/domain/exceptions/entity-not-found.exception';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { PasswordHasher } from '../../../domain/ports/password-hasher';
import { InvalidCredentialsException } from '../../../domain/exceptions/invalid-credentials.exception';
import { ChangePasswordCommand } from './change-password.command';

@Injectable()
export class ChangePasswordUseCase implements UseCase<ChangePasswordCommand, void> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(command: ChangePasswordCommand): Promise<void> {
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new EntityNotFoundException('User', command.userId);
    }

    const isValid = await this.passwordHasher.compare(
      command.currentPassword,
      user.passwordHash,
    );
    if (!isValid) {
      throw new InvalidCredentialsException();
    }

    const nextHash = await this.passwordHasher.hash(command.nextPassword);
    user.setPasswordHash(nextHash);
    await this.userRepository.save(user);
  }
}
