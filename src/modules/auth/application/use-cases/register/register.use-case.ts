import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../../shared/application/use-case.interface';
import { User } from '../../../domain/entities/user.entity';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { PasswordHasher } from '../../../domain/ports/password-hasher';
import { EmailAlreadyRegisteredException } from '../../../domain/exceptions/email-already-registered.exception';
import { RegisterCommand } from './register.command';

@Injectable()
export class RegisterUseCase implements UseCase<RegisterCommand, User> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(command: RegisterCommand): Promise<User> {
    const existing = await this.userRepository.findByEmail(command.email);
    if (existing) {
      throw new EmailAlreadyRegisteredException(command.email);
    }

    const passwordHash = await this.passwordHasher.hash(command.password);
    const user = User.create({
      email: command.email,
      passwordHash,
      name: command.name,
      role: command.role,
      phone: command.phone,
    });

    await this.userRepository.save(user);
    return user;
  }
}
