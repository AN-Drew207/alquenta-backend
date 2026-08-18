import { ApiProperty } from '@nestjs/swagger';

export class RevealContactResponseDto {
  @ApiProperty()
  whatsapp: string;
}
