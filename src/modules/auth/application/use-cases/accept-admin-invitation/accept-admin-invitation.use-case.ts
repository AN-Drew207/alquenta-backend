import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UseCase } from '../../../../../shared/application/use-case.interface';
import { Role } from '../../../../../shared/domain/role.enum';
import { User } from '../../../domain/entities/user.entity';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { PasswordHasher } from '../../../domain/ports/password-hasher';
import { EmailAlreadyRegisteredException } from '../../../domain/exceptions/email-already-registered.exception';
import { InvalidVerificationTokenException } from '../../../domain/exceptions/invalid-verification-token.exception';
import { AcceptAdminInvitationCommand } from './accept-admin-invitation.command';

interface AdminInviteTokenPayload {
  email: string;
  planId: string;
  purpose: string;
}

@Injectable()
export class AcceptAdminInvitationUseCase
  implements UseCase<AcceptAdminInvitationCommand, User>
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly jwtService: JwtService,
  ) {}

  async execute(command: AcceptAdminInvitationCommand): Promise<User> {
    let payload: AdminInviteTokenPayload;
    try {
      payload = this.jwtService.verify<AdminInviteTokenPayload>(command.token);
    } catch {
      throw new InvalidVerificationTokenException(
        'This invitation link is invalid or expired.',
      );
    }
    if (payload.purpose !== 'admin-invite') {
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
      role: Role.ADMIN,
      planId: payload.planId,
    });

    await this.userRepository.save(user);
    return user;
  }
}
