import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PropertyType } from '../../../domain/enums/property-type.enum';

export class ListPropertiesQueryDto {
  @ApiProperty({ enum: PropertyType, required: false })
  @IsOptional()
  @IsEnum(PropertyType)
  type?: PropertyType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  city?: string;
}
