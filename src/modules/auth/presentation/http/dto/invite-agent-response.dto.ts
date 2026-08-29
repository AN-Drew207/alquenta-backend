import { ApiProperty } from '@nestjs/swagger';

export class InviteAgentResponseDto {
  @ApiProperty({
    description:
      'Share this link with the invited agent manually (WhatsApp, etc.) — no email is sent automatically.',
  })
  inviteUrl: string;
}
