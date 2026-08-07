import { ApiProperty } from '@nestjs/swagger';
import { PropertyType } from '../../../domain/enums/property-type.enum';
import { OperationType } from '../../../domain/enums/operation-type.enum';
import { PropertyStatus } from '../../../domain/enums/property-status.enum';

export class PropertyResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  adminId: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  city: string;

  @ApiProperty({ enum: PropertyType })
  type: PropertyType;

  @ApiProperty({ enum: OperationType })
  operationType: OperationType;

  @ApiProperty()
  price: number;

  @ApiProperty({ enum: PropertyStatus })
  status: PropertyStatus;

  @ApiProperty({ required: false, nullable: true })
  bedrooms: number | null;

  @ApiProperty({ required: false, nullable: true })
  bathrooms: number | null;

  @ApiProperty({ required: false, nullable: true })
  squareMeters: number | null;

  @ApiProperty({ type: [String] })
  images: string[];

  @ApiProperty()
  createdAt: Date;
}
