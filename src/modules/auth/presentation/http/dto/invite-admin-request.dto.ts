import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsUUID } from 'class-validator';

export class InviteAdminRequestDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Id of the Plan to assign once the invite is accepted' })
  @IsUUID()
  planId: string;
}
