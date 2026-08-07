import { ApiProperty } from '@nestjs/swagger';

export class ConversationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  propertyId: string;

  @ApiProperty()
  clientId: string;

  @ApiProperty()
  adminId: string;

  @ApiProperty()
  createdAt: Date;
}
