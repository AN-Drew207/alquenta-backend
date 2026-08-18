import { ApiProperty } from '@nestjs/swagger';
import { ReportReason } from '../../../domain/enums/report-reason.enum';
import { ReportStatus } from '../../../domain/enums/report-status.enum';

export class ReportResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  propertyId: string;

  @ApiProperty()
  propertyTitle: string;

  @ApiProperty()
  reporterEmail: string;

  @ApiProperty()
  reporterName: string;

  @ApiProperty({ enum: ReportReason })
  reason: ReportReason;

  @ApiProperty({ required: false, nullable: true })
  details: string | null;

  @ApiProperty({ enum: ReportStatus })
  status: ReportStatus;

  @ApiProperty()
  createdAt: Date;
}
