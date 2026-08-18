import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { PropertyType } from '../../../domain/enums/property-type.enum';
import { OperationType } from '../../../domain/enums/operation-type.enum';
import type {
  PropertySortBy,
  SortOrder,
} from '../../../domain/repositories/property-filters.interface';

export class ListPropertiesQueryDto {
  @ApiProperty({ enum: PropertyType, required: false })
  @IsOptional()
  @IsEnum(PropertyType)
  type?: PropertyType;

  @ApiProperty({ enum: OperationType, required: false })
  @IsOptional()
  @IsEnum(OperationType)
  operationType?: OperationType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  adminId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  municipality?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  bedrooms?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  bathrooms?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  parkingSpaces?: number;

  @ApiProperty({
    required: false,
    description: 'Case-insensitive substring match against the title.',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    required: false,
    enum: ['price', 'createdAt', 'squareMeters'],
  })
  @IsOptional()
  @IsIn(['price', 'createdAt', 'squareMeters'])
  sortBy?: PropertySortBy;

  @ApiProperty({ required: false, enum: ['asc', 'desc'] })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: SortOrder;
}
