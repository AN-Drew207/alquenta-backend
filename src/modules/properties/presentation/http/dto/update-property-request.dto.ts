import { ApiProperty } from '@nestjs/swagger';
import { OmitType, PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { PropertyStatus } from '../../../domain/enums/property-status.enum';
import { CreatePropertyRequestDto } from './create-property-request.dto';

export class UpdatePropertyRequestDto extends PartialType(
  OmitType(CreatePropertyRequestDto, ['agentId'] as const),
) {
  @ApiProperty({ enum: PropertyStatus, required: false })
  @IsOptional()
  @IsEnum(PropertyStatus)
  status?: PropertyStatus;
}
