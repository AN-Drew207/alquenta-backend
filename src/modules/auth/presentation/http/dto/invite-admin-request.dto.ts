import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class InviteAdminRequestDto {
  @ApiProperty()
  @IsEmail()
  email: string;
}
