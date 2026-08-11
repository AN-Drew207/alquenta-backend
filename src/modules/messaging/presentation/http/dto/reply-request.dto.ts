import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ReplyRequestDto {
  @ApiProperty()
  @IsString()
  content: string;
}
