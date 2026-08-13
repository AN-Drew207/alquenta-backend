import { ApiProperty } from '@nestjs/swagger';

export class MediaSignatureResponseDto {
  @ApiProperty()
  timestamp: number;

  @ApiProperty()
  signature: string;

  @ApiProperty()
  apiKey: string;

  @ApiProperty()
  cloudName: string;

  @ApiProperty()
  folder: string;

  @ApiProperty()
  maxFileSize: number;

  @ApiProperty({ enum: ['image', 'video'] })
  resourceType: 'image' | 'video';

  @ApiProperty({ required: false })
  transformation?: string;
}
