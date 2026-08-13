import { Message } from '../../../domain/entities/message.entity';
import { MessageResponseDto } from '../dto/message-response.dto';

export class MessageResponseMapper {
  static toDto(message: Message): MessageResponseDto {
    return {
      id: message.id,
      conversationId: message.conversationId,
      authorId: message.authorId,
      authorName: message.authorName,
      content: message.content,
      read: message.read,
      createdAt: message.createdAt,
    };
  }
}
