import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UseCase } from '../../../../../shared/application/use-case.interface';
import { Role } from '../../../../../shared/domain/role.enum';
import { User } from '../../../domain/entities/user.entity';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { PasswordHasher } from '../../../domain/ports/password-hasher';
import { EmailAlreadyRegisteredException } from '../../../domain/exceptions/email-already-registered.exception';
import { InvalidVerificationTokenException } from '../../../domain/exceptions/invalid-verification-token.exception';
import { AcceptAgentInvitationCommand } from './accept-agent-invitation.command';

interface AgentInviteTokenPayload {
  email: string;
  parentAdminId: string;
  purpose: string;
}

@Injectable()
export class AcceptAgentInvitationUseCase implements UseCase<
  AcceptAgentInvitationCommand,
  User
> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly jwtService: JwtService,
  ) {}

  async execute(command: AcceptAgentInvitationCommand): Promise<User> {
    let payload: AgentInviteTokenPayload;
    try {
      payload = this.jwtService.verify<AgentInviteTokenPayload>(command.token);
    } catch {
      throw new InvalidVerificationTokenException(
        'This invitation link is invalid or expired.',
      );
    }
    if (payload.purpose !== 'agent-invite') {
      throw new InvalidVerificationTokenException(
        'This invitation link is invalid.',
      );
    }

    // Defensive re-check: the admin who invited this agent might have been
    // deleted between the invite and the accept — don't let a raw FK error
    // leak, surface the same "invalid invitation" error instead.
    const admin = await this.userRepository.findById(payload.parentAdminId);
    if (!admin || admin.role !== Role.ADMIN) {
      throw new InvalidVerificationTokenException(
        'This invitation link is invalid.',
      );
    }

    const existing = await this.userRepository.findByEmail(payload.email);
    if (existing) {
      throw new EmailAlreadyRegisteredException(payload.email);
    }

    const passwordHash = await this.passwordHasher.hash(command.password);
    const user = User.create({
      email: payload.email,
      passwordHash,
      name: command.name,
      role: Role.AGENT,
      parentAdminId: payload.parentAdminId,
    });

    await this.userRepository.save(user);
    return user;
  }
}
