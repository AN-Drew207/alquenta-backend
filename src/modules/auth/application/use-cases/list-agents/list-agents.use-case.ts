import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../../shared/application/use-case.interface';
import { User } from '../../../domain/entities/user.entity';
import { UserRepository } from '../../../domain/repositories/user.repository';

@Injectable()
export class ListAgentsUseCase implements UseCase<string, User[]> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(parentAdminId: string): Promise<User[]> {
    return this.userRepository.findManyByParentAdminId(parentAdminId);
  }
}
