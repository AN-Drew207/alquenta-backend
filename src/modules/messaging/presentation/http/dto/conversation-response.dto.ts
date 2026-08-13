import { ApiProperty } from '@nestjs/swagger';

export class ConversationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  propertyId: string;

  @ApiProperty()
  clientId: string;

  @ApiProperty()
  clientName: string;

  @ApiProperty()
  adminId: string;

  @ApiProperty()
  adminName: string;

  @ApiProperty()
  createdAt: Date;
}
