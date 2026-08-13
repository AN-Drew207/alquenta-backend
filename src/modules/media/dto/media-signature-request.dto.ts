import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';

export class MediaSignatureRequestDto {
  @ApiProperty({ enum: ['image', 'video'] })
  @IsIn(['image', 'video'])
  resourceType: 'image' | 'video';

  @ApiProperty({
    enum: ['property', 'avatar'],
    required: false,
    description: 'What the upload is for — defaults to "property". "avatar" is open to any authenticated user.',
  })
  @IsOptional()
  @IsIn(['property', 'avatar'])
  target?: 'property' | 'avatar';
}
