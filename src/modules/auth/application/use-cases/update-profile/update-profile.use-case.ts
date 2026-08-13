import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../../shared/application/use-case.interface';
import { EntityNotFoundException } from '../../../../../shared/domain/exceptions/entity-not-found.exception';
import { User } from '../../../domain/entities/user.entity';
import { UserRepository } from '../../../domain/repositories/user.repository';
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

    user.updateProfile({
      phone: command.phone,
      showPhoneOnListings: command.showPhoneOnListings,
    });
    await this.userRepository.save(user);
    return user;
  }
}
