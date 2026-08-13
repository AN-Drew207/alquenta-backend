import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../../shared/application/use-case.interface';
import { EntityNotFoundException } from '../../../../../shared/domain/exceptions/entity-not-found.exception';
import { User } from '../../../domain/entities/user.entity';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { UsernameTakenException } from '../../../domain/exceptions/username-taken.exception';
import { UpdateProfileCommand } from './update-profile.command';

@Injectable()
export class UpdateProfileUseCase
  implements UseCase<UpdateProfileCommand, User>
{
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: UpdateProfileCommand): Promise<User> {
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new EntityNotFoundException('User', command.userId);
    }

    const { fields } = command;

    if (fields.username !== undefined && fields.username !== user.username) {
      const existing = fields.username
        ? await this.userRepository.findByUsername(fields.username)
        : null;
      if (existing && existing.id !== user.id) {
        throw new UsernameTakenException(fields.username as string);
      }
    }

    user.updateProfile(fields);
    await this.userRepository.save(user);
    return user;
  }
}
