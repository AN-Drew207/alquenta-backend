import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { PropertyType } from '../../../domain/enums/property-type.enum';
import { OperationType } from '../../../domain/enums/operation-type.enum';

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
}
