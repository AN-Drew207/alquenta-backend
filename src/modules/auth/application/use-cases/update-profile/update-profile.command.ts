import { AccountType } from '../../../domain/enums/account-type.enum';
import {
  GeneralPrefs,
  NotificationPrefs,
  PrivacyPrefs,
} from '../../../domain/entities/user-preferences';

export interface UpdateProfileCommandFields {
  /** Alias for the underlying `name` column — see User.updateProfile(). */
  displayName?: string;
  firstName?: string;
  lastName?: string;
  username?: string | null;
  accountType?: AccountType;
  avatarUrl?: string | null;
  bio?: string | null;
  city?: string | null;
  state?: string | null;
  website?: string | null;
  phone?: string | null;
  altPhone?: string | null;
  showWhatsapp?: boolean;
  allowCalls?: boolean;
  showEmail?: boolean;
  notificationPrefs?: NotificationPrefs;
  privacyPrefs?: PrivacyPrefs;
  generalPrefs?: GeneralPrefs;
  twoFactorEnabled?: boolean;
}

export class UpdateProfileCommand {
  readonly userId: string;
  readonly fields: UpdateProfileCommandFields;

  constructor(userId: string, fields: UpdateProfileCommandFields) {
    this.userId = userId;
    this.fields = fields;
  }
}
