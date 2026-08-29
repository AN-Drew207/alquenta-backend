import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UseCase } from '../../../../../shared/application/use-case.interface';
import { Role } from '../../../../../shared/domain/role.enum';
import { EntityNotFoundException } from '../../../../../shared/domain/exceptions/entity-not-found.exception';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { EmailAlreadyRegisteredException } from '../../../domain/exceptions/email-already-registered.exception';
import { InviteAgentCommand } from './invite-agent.command';

const INVITE_EXPIRES_IN = '7d';

@Injectable()
export class InviteAgentUseCase implements UseCase<InviteAgentCommand, string> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async execute(command: InviteAgentCommand): Promise<string> {
    const existing = await this.userRepository.findByEmail(command.email);
    if (existing) {
      throw new EmailAlreadyRegisteredException(command.email);
    }

    const admin = await this.userRepository.findById(command.parentAdminId);
    if (!admin || admin.role !== Role.ADMIN) {
      throw new EntityNotFoundException('Admin', command.parentAdminId);
    }

    const token = this.jwtService.sign(
      {
        email: command.email,
        parentAdminId: command.parentAdminId,
        purpose: 'agent-invite',
      },
      { expiresIn: INVITE_EXPIRES_IN },
    );
    const frontUrl = (this.configService.get<string>('FRONT_URL') ?? '')
      .split(',')[0]
      .trim()
      .replace(/\/+$/, '');
    return `${frontUrl}/agent-invite?token=${token}`;
  }
}
