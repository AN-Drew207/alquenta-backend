import { DomainForbiddenException } from '../../../../shared/domain/exceptions/domain-forbidden.exception';

export class NotConversationParticipantException extends DomainForbiddenException {
  constructor(conversationId: string) {
    super(
      `The authenticated user is not a participant of conversation "${conversationId}"`,
    );
  }
}
