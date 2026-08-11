import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class StartConversationRequestDto {
  @ApiProperty()
  @IsUUID()
  propertyId: string;

  @ApiProperty()
  @IsString()
  content: string;
}
