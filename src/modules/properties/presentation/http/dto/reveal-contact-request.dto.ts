import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RevealContactRequestDto {
  @ApiProperty({
    description: 'The contactRevealToken from GET /properties/:id.',
  })
  @IsString()
  token: string;
}
