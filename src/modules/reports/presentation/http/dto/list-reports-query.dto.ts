import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { ReportStatus } from '../../../domain/enums/report-status.enum';

export class ListReportsQueryDto {
  @ApiProperty({
    enum: ReportStatus,
    required: false,
    description: 'Omit to get every report regardless of status.',
  })
  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;
}
