import { ApiProperty } from '@nestjs/swagger';

export class PropertyAnalyticsTrendPointResponseDto {
  @ApiProperty({
    description: 'ISO calendar date (UTC), e.g. "2026-08-18".',
  })
  day: string;

  @ApiProperty({ description: 'VIEW events recorded on this day.' })
  viewCount: number;

  @ApiProperty({
    description:
      'Contact events recorded on this day (WHATSAPP_REVEAL + MESSAGE_STARTED combined).',
  })
  contactCount: number;
}
