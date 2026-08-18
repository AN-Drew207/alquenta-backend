import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { PropertyType } from '../../../domain/enums/property-type.enum';
import { OperationType } from '../../../domain/enums/operation-type.enum';

export const MAX_IMAGES = 8;
export const MAX_VIDEOS = 2;

export class CreatePropertyRequestDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsString()
  state: string;

  @ApiProperty()
  @IsString()
  municipality: string;

  @ApiProperty({ enum: PropertyType })
  @IsEnum(PropertyType)
  type: PropertyType;

  @ApiProperty({ enum: OperationType })
  @IsEnum(OperationType)
  operationType: OperationType;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  bedrooms?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  bathrooms?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  parkingSpaces?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  squareMeters?: number;

  @ApiProperty({
    type: [String],
    minItems: 1,
    maxItems: MAX_IMAGES,
    description: 'At least one photo is required to publish a listing.',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_IMAGES)
  @IsString({ each: true })
  images: string[];

  @ApiProperty({ required: false, type: [String], maxItems: MAX_VIDEOS })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_VIDEOS)
  @IsString({ each: true })
  videos?: string[];

  @ApiProperty({
    required: false,
    description: 'WhatsApp number for this listing specifically (overrides the profile default)',
  })
  @IsOptional()
  @IsString()
  whatsapp?: string;

  @ApiProperty({
    required: false,
    description: 'Latitude of the pin the admin placed on the location picker.',
  })
  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @ApiProperty({
    required: false,
    description: 'Longitude of the pin the admin placed on the location picker.',
  })
  @IsOptional()
  @IsLongitude()
  longitude?: number;
}
