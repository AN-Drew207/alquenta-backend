import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export type PropertyAnalyticsExportFormat = 'csv' | 'pdf';

export class ExportPropertyAnalyticsQueryDto {
  @ApiProperty({ enum: ['csv', 'pdf'] })
  @IsIn(['csv', 'pdf'])
  format: PropertyAnalyticsExportFormat;
}
