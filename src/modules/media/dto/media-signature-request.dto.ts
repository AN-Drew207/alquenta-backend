import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class MediaSignatureRequestDto {
  @ApiProperty({ enum: ['image', 'video'] })
  @IsIn(['image', 'video'])
  resourceType: 'image' | 'video';
}
