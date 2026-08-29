import { ApiProperty } from '@nestjs/swagger';

export class PropertyAnalyticsRankingEntryResponseDto {
  @ApiProperty()
  propertyId: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ description: 'Total VIEW events recorded.' })
  totalViews: number;

  @ApiProperty({
    description:
      'Total contact events (WHATSAPP_REVEAL + MESSAGE_STARTED combined).',
  })
  totalContacts: number;

  @ApiProperty({
    description:
      'totalContacts / totalViews, or 0 when there are no views yet.',
  })
  conversionRate: number;
}
