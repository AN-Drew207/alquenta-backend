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

  @ApiProperty({ required: false, nullable: true })
  offerAmount: number | null;

  @ApiProperty()
  read: boolean;

  @ApiProperty()
  createdAt: Date;
}
