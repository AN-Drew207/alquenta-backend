import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../../shared/application/use-case.interface';
import { EntityNotFoundException } from '../../../../../shared/domain/exceptions/entity-not-found.exception';
import { EmailSender } from '../../../../../shared/domain/ports/email-sender';
import { UserRepository } from '../../../domain/repositories/user.repository';

@Injectable()
export class ExportAccountDataUseCase implements UseCase<string, void> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailSender: EmailSender,
  ) {}

  async execute(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new EntityNotFoundException('User', userId);
    }

    const data = {
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
      role: user.role,
      accountType: user.accountType,
      bio: user.bio,
      city: user.city,
      state: user.state,
      website: user.website,
      phone: user.phone,
      altPhone: user.altPhone,
      notificationPrefs: user.notificationPrefs,
      privacyPrefs: user.privacyPrefs,
      generalPrefs: user.generalPrefs,
      exportedAt: new Date().toISOString(),
    };

    const json = JSON.stringify(data, null, 2);
    await this.emailSender.send({
      to: user.email,
      subject: 'Tus datos de Alquenta',
      html: '<p>Adjunto encontrarás una copia de tus datos de cuenta en formato JSON.</p>',
      attachments: [
        {
          filename: 'alquenta-datos.json',
          content: Buffer.from(json, 'utf-8').toString('base64'),
        },
      ],
    });
  }
}
