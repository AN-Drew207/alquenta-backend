import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UseCase } from '../../../../../shared/application/use-case.interface';
import { EntityNotFoundException } from '../../../../../shared/domain/exceptions/entity-not-found.exception';
import { InvalidVerificationTokenException } from '../../../domain/exceptions/invalid-verification-token.exception';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { User } from '../../../domain/entities/user.entity';

interface EmailChangeTokenPayload {
  sub: string;
  newEmail: string;
  purpose: string;
}

@Injectable()
export class ConfirmEmailChangeUseCase implements UseCase<string, User> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(token: string): Promise<User> {
    let payload: EmailChangeTokenPayload;
    try {
      payload = this.jwtService.verify<EmailChangeTokenPayload>(token);
    } catch {
      throw new InvalidVerificationTokenException();
    }

    if (payload.purpose !== 'email-change') {
      throw new InvalidVerificationTokenException(
        'This confirmation link is invalid.',
      );
    }

    const user = await this.userRepository.findById(payload.sub);
    if (!user) {
      throw new EntityNotFoundException('User', payload.sub);
    }
    if (user.pendingEmail !== payload.newEmail) {
      throw new InvalidVerificationTokenException(
        'This confirmation link is no longer valid — the email change may have already been confirmed or a newer one requested.',
      );
    }

    user.confirmEmailChange();
    await this.userRepository.save(user);
    return user;
  }
}
