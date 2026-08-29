import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../../shared/application/use-case.interface';
import { EntityNotFoundException } from '../../../../../shared/domain/exceptions/entity-not-found.exception';
import { InvalidContactRevealTokenException } from '../../../domain/exceptions/invalid-contact-reveal-token.exception';
import { ContactRevealTokenService } from '../../../infrastructure/security/contact-reveal-token.service';
import { RecordAnalyticsEventUseCase } from '../../../../analytics/application/use-cases/record-analytics-event/record-analytics-event.use-case';
import { RecordAnalyticsEventCommand } from '../../../../analytics/application/use-cases/record-analytics-event/record-analytics-event.command';
import { PropertyAnalyticsEventType } from '../../../../analytics/domain/enums/property-analytics-event-type.enum';
import { ResolvePropertyWhatsappUseCase } from '../resolve-property-whatsapp/resolve-property-whatsapp.use-case';
import { RevealPropertyContactCommand } from './reveal-property-contact.command';

@Injectable()
export class RevealPropertyContactUseCase implements UseCase<
  RevealPropertyContactCommand,
  string
> {
  constructor(
    private readonly tokenService: ContactRevealTokenService,
    private readonly resolveWhatsappUseCase: ResolvePropertyWhatsappUseCase,
    private readonly recordAnalyticsEventUseCase: RecordAnalyticsEventUseCase,
  ) {}

  async execute(command: RevealPropertyContactCommand): Promise<string> {
    if (!this.tokenService.verify(command.propertyId, command.token)) {
      throw new InvalidContactRevealTokenException();
    }

    // Re-resolved fresh rather than embedded in the token, so an admin
    // toggling showWhatsapp off between page load and reveal-click is
    // respected immediately instead of honoring a stale snapshot.
    const whatsapp = await this.resolveWhatsappUseCase.execute(
      command.propertyId,
    );
    if (!whatsapp) {
      throw new EntityNotFoundException('Property', command.propertyId);
    }

    await this.recordAnalyticsEventUseCase.execute(
      new RecordAnalyticsEventCommand(
        command.propertyId,
        PropertyAnalyticsEventType.WHATSAPP_REVEAL,
      ),
    );

    return whatsapp;
  }
}
