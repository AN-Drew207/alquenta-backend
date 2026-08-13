import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsInt,
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

  @ApiProperty({ required: false, type: [String], maxItems: MAX_IMAGES })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_IMAGES)
  @IsString({ each: true })
  images?: string[];

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
}
