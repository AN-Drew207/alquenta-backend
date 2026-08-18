import { ApiProperty } from '@nestjs/swagger';

export class AdminResponseStatsResponseDto {
  @ApiProperty({ description: 'Fraction (0..1) of conversations that got a reply.' })
  responseRate: number;

  @ApiProperty({
    required: false,
    nullable: true,
    description: 'Mean minutes from the first client message to the first reply.',
  })
  averageResponseMinutes: number | null;

  @ApiProperty({ description: 'How many conversations this is based on.' })
  sampleSize: number;
}
