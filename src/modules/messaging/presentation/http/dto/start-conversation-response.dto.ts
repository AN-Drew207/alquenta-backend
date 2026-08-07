import { ApiProperty } from '@nestjs/swagger';
import { ConversationResponseDto } from './conversation-response.dto';
import { MessageResponseDto } from './message-response.dto';

export class StartConversationResponseDto {
  @ApiProperty({ type: ConversationResponseDto })
  conversation: ConversationResponseDto;

  @ApiProperty({ type: MessageResponseDto })
  message: MessageResponseDto;
}
