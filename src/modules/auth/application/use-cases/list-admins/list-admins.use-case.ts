import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../../shared/application/use-case.interface';
import { Role } from '../../../../../shared/domain/role.enum';
import { User } from '../../../domain/entities/user.entity';
import { UserRepository } from '../../../domain/repositories/user.repository';

@Injectable()
export class ListAdminsUseCase implements UseCase<void, User[]> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(): Promise<User[]> {
    return this.userRepository.findManyByRole(Role.ADMIN);
  }
}
