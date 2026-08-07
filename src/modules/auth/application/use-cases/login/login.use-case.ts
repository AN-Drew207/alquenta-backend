import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../../shared/application/use-case.interface';
import { User } from '../../../domain/entities/user.entity';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { PasswordHasher } from '../../../domain/ports/password-hasher';
import { InvalidCredentialsException } from '../../../domain/exceptions/invalid-credentials.exception';
import { LoginCommand } from './login.command';

@Injectable()
export class LoginUseCase implements UseCase<LoginCommand, User> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(command: LoginCommand): Promise<User> {
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

    return user;
  }
}
