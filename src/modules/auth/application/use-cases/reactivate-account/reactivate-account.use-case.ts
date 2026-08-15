import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../../shared/application/use-case.interface';
import { User } from '../../../domain/entities/user.entity';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { PasswordHasher } from '../../../domain/ports/password-hasher';
import { InvalidCredentialsException } from '../../../domain/exceptions/invalid-credentials.exception';
import { AccountDisabledBySuperadminException } from '../../../domain/exceptions/account-disabled-by-superadmin.exception';
import { ReactivateAccountCommand } from './reactivate-account.command';

/**
 * Re-verifies credentials (this is an unauthenticated endpoint, reachable
 * only after a login attempt reports the account as self-deactivated) and
 * clears the deactivation. Accounts disabled by a superadmin cannot be
 * reactivated this way — only another superadmin can re-enable them.
 */
@Injectable()
export class ReactivateAccountUseCase
  implements UseCase<ReactivateAccountCommand, User>
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(command: ReactivateAccountCommand): Promise<User> {
    const user = await this.userRepository.findByEmail(command.email);
    if (!user) {
      throw new InvalidCredentialsException();
    }

    const isValid = await this.passwordHasher.compare(
      command.password,
      user.passwordHash,
    );
    if (!isValid) {
      throw new InvalidCredentialsException();
    }

    if (user.deactivatedAt && user.deactivatedBySuperadmin) {
      throw new AccountDisabledBySuperadminException();
    }

    if (user.deactivatedAt) {
      user.reactivate();
      await this.userRepository.save(user);
    }

    return user;
  }
}
