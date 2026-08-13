import { Conversation } from '../../../domain/entities/conversation.entity';
import { ConversationResponseDto } from '../dto/conversation-response.dto';

export class ConversationResponseMapper {
  static toDto(conversation: Conversation): ConversationResponseDto {
    return {
      id: conversation.id,
      propertyId: conversation.propertyId,
      clientId: conversation.clientId,
      clientName: conversation.clientName,
      adminId: conversation.adminId,
      adminName: conversation.adminName,
      createdAt: conversation.createdAt,
    };
  }
}
