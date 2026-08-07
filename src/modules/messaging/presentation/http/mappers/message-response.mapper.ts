import { Message } from '../../../domain/entities/message.entity';
import { MessageResponseDto } from '../dto/message-response.dto';

export class MessageResponseMapper {
  static toDto(message: Message): MessageResponseDto {
    return {
      id: message.id,
      conversationId: message.conversationId,
      authorId: message.authorId,
      content: message.content,
      offerAmount: message.offerAmount,
      read: message.read,
      createdAt: message.createdAt,
    };
  }
}
