import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import type { GeneralPrefs } from '../../../domain/entities/user-preferences';

const RESERVED_USERNAMES = new Set([
  'admin',
  'administrator',
  'root',
  'api',
  'auth',
  'profile',
  'account',
  'alquenta',
  'support',
  'help',
  'null',
  'undefined',
]);

export function isReservedUsername(username: string): boolean {
  return RESERVED_USERNAMES.has(username.toLowerCase());
}

export class PatchProfileRequestDto {
  @ApiProperty({
    required: false,
    minLength: 1,
    maxLength: 60,
    description:
      'Alias for the underlying `name` column. Changing it propagates to the header, conversations, and property listings.',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  displayName?: string;

  @ApiProperty({ required: false, minLength: 2, maxLength: 40 })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(40)
  @Matches(/^[\p{L}\s]+$/u, {
    message: 'firstName must contain letters and spaces only',
  })
  firstName?: string;

  @ApiProperty({ required: false, minLength: 2, maxLength: 40 })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(40)
  @Matches(/^[\p{L}\s]+$/u, {
    message: 'lastName must contain letters and spaces only',
  })
  lastName?: string;

  @ApiProperty({ required: false, nullable: true, minLength: 3, maxLength: 24 })
  @IsOptional()
  @Matches(/^[a-z0-9_]{3,24}$/, {
    message:
      'username must be 3-24 characters, lowercase letters, numbers, and underscores only',
  })
  username?: string | null;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  avatarUrl?: string | null;

  @ApiProperty({ required: false, nullable: true, maxLength: 280 })
  @IsOptional()
  @IsString()
  @MaxLength(280)
  bio?: string | null;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  city?: string | null;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  state?: string | null;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  website?: string | null;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  phone?: string | null;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  altPhone?: string | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  showWhatsapp?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  allowCalls?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  showEmail?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  generalPrefs?: GeneralPrefs;
}
