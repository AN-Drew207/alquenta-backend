import { ApiProperty } from '@nestjs/swagger';

export class AdminSummaryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false, nullable: true })
  phone: string | null;

  @ApiProperty({ required: false, nullable: true })
  planId: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ required: false, nullable: true })
  deactivatedAt: Date | null;
}
