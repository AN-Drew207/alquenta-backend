import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class RequestEmailChangeRequestDto {
  @ApiProperty()
  @IsEmail()
  newEmail: string;
}
