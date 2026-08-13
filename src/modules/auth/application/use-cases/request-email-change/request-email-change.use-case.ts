import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UseCase } from '../../../../../shared/application/use-case.interface';
import { EntityNotFoundException } from '../../../../../shared/domain/exceptions/entity-not-found.exception';
import { EmailSender } from '../../../../../shared/domain/ports/email-sender';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { EmailAlreadyRegisteredException } from '../../../domain/exceptions/email-already-registered.exception';
import { RequestEmailChangeCommand } from './request-email-change.command';

const TOKEN_EXPIRES_IN = '1h';

@Injectable()
export class RequestEmailChangeUseCase
  implements UseCase<RequestEmailChangeCommand, void>
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly emailSender: EmailSender,
    private readonly configService: ConfigService,
  ) {}

  async execute(command: RequestEmailChangeCommand): Promise<void> {
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new EntityNotFoundException('User', command.userId);
    }

    const existing = await this.userRepository.findByEmail(command.newEmail);
    if (existing && existing.id !== user.id) {
      throw new EmailAlreadyRegisteredException(command.newEmail);
    }

    user.requestEmailChange(command.newEmail);
    await this.userRepository.save(user);

    const token = this.jwtService.sign(
      { sub: user.id, newEmail: command.newEmail, purpose: 'email-change' },
      { expiresIn: TOKEN_EXPIRES_IN },
    );
    const frontUrl = (this.configService.get<string>('FRONT_URL') ?? '')
      .split(',')[0]
      .trim()
      .replace(/\/+$/, '');
    const confirmUrl = `${frontUrl}/profile/verify-email?token=${token}`;

    await this.emailSender.send({
      to: command.newEmail,
      subject: 'Confirma tu nuevo correo — Alquenta',
      html: `<p>Confirma que este es tu nuevo correo electrónico en Alquenta.</p><p><a href="${confirmUrl}">Confirmar correo</a></p><p>Este enlace vence en 1 hora.</p>`,
    });
  }
}
