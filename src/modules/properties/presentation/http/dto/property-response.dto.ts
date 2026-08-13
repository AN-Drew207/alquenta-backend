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
  state: string;

  @ApiProperty()
  municipality: string;

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
  parkingSpaces: number | null;

  @ApiProperty({ required: false, nullable: true })
  squareMeters: number | null;

  @ApiProperty({ type: [String] })
  images: string[];

  @ApiProperty({ type: [String] })
  videos: string[];

  @ApiProperty({ required: false, nullable: true })
  whatsapp: string | null;

  @ApiProperty({
    required: false,
    nullable: true,
    description:
      'Effective WhatsApp number to contact about this listing (this property\'s own number, or the owner\'s profile number if they opted to show it)',
  })
  contactWhatsapp: string | null;

  @ApiProperty()
  createdAt: Date;
}
