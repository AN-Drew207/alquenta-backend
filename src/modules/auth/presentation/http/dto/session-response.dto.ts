import { ApiProperty } from '@nestjs/swagger';

export class SessionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ required: false, nullable: true })
  userAgent: string | null;

  @ApiProperty({ required: false, nullable: true })
  ip: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  lastActiveAt: Date;

  @ApiProperty()
  current: boolean;
}
