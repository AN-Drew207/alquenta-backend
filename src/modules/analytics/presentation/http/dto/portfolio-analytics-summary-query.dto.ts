import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsISO8601, IsOptional, IsString } from 'class-validator';
import { PropertyType } from '../../../../properties/domain/enums/property-type.enum';
import { OperationType } from '../../../../properties/domain/enums/operation-type.enum';
import { PropertyStatus } from '../../../../properties/domain/enums/property-status.enum';

/**
 * All fields optional — Fase 4's filters on GET /analytics/summary. Any
 * field present bumps the access gate to ENTERPRISE (see
 * GetPortfolioAnalyticsSummaryUseCase); an empty query reproduces Fase 1's
 * STARTER+ behavior exactly. `from`/`to` are plain ISO 8601 strings here
 * (not `@Type(() => Date)`), parsed to Date in the controller — avoids the
 * class-transformer pitfall where an invalid date string still transforms
 * into an (invalid) Date instance that `@IsDate()` would accept.
 */
export class PortfolioAnalyticsSummaryQueryDto {
  @ApiProperty({
    enum: PropertyType,
    required: false,
    description: 'Restrict the aggregate to properties of this type.',
  })
  @IsOptional()
  @IsEnum(PropertyType)
  type?: PropertyType;

  @ApiProperty({
    enum: OperationType,
    required: false,
    description: 'Restrict the aggregate to properties of this operation type.',
  })
  @IsOptional()
  @IsEnum(OperationType)
  operationType?: OperationType;

  @ApiProperty({
    required: false,
    description: 'Restrict the aggregate to properties in this state.',
  })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({
    enum: PropertyStatus,
    required: false,
    description: 'Restrict the aggregate to properties with this status.',
  })
  @IsOptional()
  @IsEnum(PropertyStatus)
  status?: PropertyStatus;

  @ApiProperty({
    required: false,
    description:
      'ISO 8601 date/datetime. Only counts analytics events whose occurredAt is on or after this instant.',
  })
  @IsOptional()
  @IsISO8601()
  from?: string;

  @ApiProperty({
    required: false,
    description:
      'ISO 8601 date/datetime. Only counts analytics events whose occurredAt is on or before this instant.',
  })
  @IsOptional()
  @IsISO8601()
  to?: string;
}
