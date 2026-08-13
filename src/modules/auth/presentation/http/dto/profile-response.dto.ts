import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../../../../shared/domain/role.enum';
import { AccountType } from '../../../domain/enums/account-type.enum';
import type {
  GeneralPrefs,
  NotificationPrefs,
  PrivacyPrefs,
} from '../../../domain/entities/user-preferences';

export class ProfileResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ required: false, nullable: true })
  pendingEmail: string | null;

  @ApiProperty()
  emailVerified: boolean;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false, nullable: true })
  username: string | null;

  @ApiProperty({ enum: Role })
  role: Role;

  @ApiProperty({ enum: AccountType })
  accountType: AccountType;

  @ApiProperty({ required: false, nullable: true })
  avatarUrl: string | null;

  @ApiProperty({ required: false, nullable: true })
  bio: string | null;

  @ApiProperty({ required: false, nullable: true })
  city: string | null;

  @ApiProperty({ required: false, nullable: true })
  state: string | null;

  @ApiProperty({ required: false, nullable: true })
  website: string | null;

  @ApiProperty({ required: false, nullable: true })
  phone: string | null;

  @ApiProperty({ required: false, nullable: true })
  altPhone: string | null;

  @ApiProperty()
  phoneVerified: boolean;

  @ApiProperty()
  showPhoneOnListings: boolean;

  @ApiProperty()
  allowCalls: boolean;

  @ApiProperty()
  showEmail: boolean;

  @ApiProperty()
  notificationPrefs: NotificationPrefs;

  @ApiProperty()
  privacyPrefs: PrivacyPrefs;

  @ApiProperty()
  generalPrefs: GeneralPrefs;

  @ApiProperty()
  twoFactorEnabled: boolean;

  @ApiProperty({ required: false, nullable: true })
  deactivatedAt: Date | null;

  @ApiProperty()
  completeness: number;
}
