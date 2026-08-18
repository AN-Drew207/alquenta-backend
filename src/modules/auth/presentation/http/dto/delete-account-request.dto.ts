import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DeleteAccountRequestDto {
  @ApiProperty({
    description: "Must match the user's current username or email to confirm",
  })
  @IsString()
  confirmation: string;
}
