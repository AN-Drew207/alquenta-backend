import { ApiProperty } from '@nestjs/swagger';

export class PropertyAnalyticsBenchmarkResponseDto {
  @ApiProperty({
    description:
      "False when fewer than 5 comparable listings exist (same state/type/operationType, AVAILABLE, excluding the caller's own properties) — an average below that count is never shown, every other field is omitted in that case.",
  })
  available: boolean;

  @ApiProperty({
    required: false,
    description: 'Only present when available is true.',
  })
  comparableCount?: number;

  @ApiProperty({
    required: false,
    description: 'Only present when available is true.',
  })
  avgViews?: number;

  @ApiProperty({
    required: false,
    description: 'Only present when available is true.',
  })
  avgContacts?: number;

  @ApiProperty({
    required: false,
    description: 'Only present when available is true.',
  })
  propertyViews?: number;

  @ApiProperty({
    required: false,
    description: 'Only present when available is true.',
  })
  propertyContacts?: number;
}
