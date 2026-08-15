import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UseCase } from '../../../../../shared/application/use-case.interface';
import { EntityNotFoundException } from '../../../../../shared/domain/exceptions/entity-not-found.exception';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { PlanRepository } from '../../../../plans/domain/repositories/plan.repository';
import { EmailAlreadyRegisteredException } from '../../../domain/exceptions/email-already-registered.exception';
import { InviteAdminCommand } from './invite-admin.command';

const INVITE_EXPIRES_IN = '7d';

@Injectable()
export class InviteAdminUseCase implements UseCase<InviteAdminCommand, string> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly planRepository: PlanRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async execute(command: InviteAdminCommand): Promise<string> {
    const existing = await this.userRepository.findByEmail(command.email);
    if (existing) {
      throw new EmailAlreadyRegisteredException(command.email);
    }

    const plan = await this.planRepository.findById(command.planId);
    if (!plan) {
      throw new EntityNotFoundException('Plan', command.planId);
    }

    const token = this.jwtService.sign(
      { email: command.email, planId: command.planId, purpose: 'admin-invite' },
      { expiresIn: INVITE_EXPIRES_IN },
    );
    const frontUrl = (this.configService.get<string>('FRONT_URL') ?? '')
      .split(',')[0]
      .trim()
      .replace(/\/+$/, '');
    return `${frontUrl}/admin-invite?token=${token}`;
  }
}
