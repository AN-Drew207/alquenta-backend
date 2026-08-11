import { ApiProperty } from '@nestjs/swagger';

export class MessageResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  conversationId: string;

  @ApiProperty()
  authorId: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  read: boolean;

  @ApiProperty()
  createdAt: Date;
}
