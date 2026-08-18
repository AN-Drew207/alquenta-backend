import { ApiProperty } from '@nestjs/swagger';
import { PropertyType } from '../../../domain/enums/property-type.enum';
import { OperationType } from '../../../domain/enums/operation-type.enum';
import { PropertyStatus } from '../../../domain/enums/property-status.enum';

/**
 * Public-facing shape of a property — deliberately has NO raw phone number
 * field (neither the listing's own `whatsapp` override nor the resolved
 * contact number). Use this DTO for every endpoint an unauthenticated
 * visitor, or any authenticated user who isn't necessarily the owning
 * admin, can reach (public catalog, single property, favorites list).
 * See PropertyResponseDto for the owner/SUPERADMIN-facing shape that does
 * include the raw number.
 */
export class PublicPropertyResponseDto {
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
  latitude: number | null;

  @ApiProperty({ required: false, nullable: true })
  longitude: number | null;

  @ApiProperty({
    description: 'Whether a WhatsApp number is available for this listing.',
  })
  hasWhatsappContact: boolean;

  @ApiProperty({
    required: false,
    nullable: true,
    description:
      'Short-lived token to redeem via POST /properties/:id/reveal-contact. Only present on the single-property endpoint, and only when hasWhatsappContact is true.',
  })
  contactRevealToken: string | null;

  @ApiProperty()
  createdAt: Date;
}
