import { ApiProperty } from '@nestjs/swagger';

export class InviteAdminResponseDto {
  @ApiProperty({
    description:
      'Share this link with the invited admin manually (WhatsApp, etc.) — no email is sent automatically.',
  })
  inviteUrl: string;
}
