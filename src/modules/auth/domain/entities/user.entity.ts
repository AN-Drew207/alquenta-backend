import { randomUUID } from 'node:crypto';
import { Role } from '../../../../shared/domain/role.enum';
import { AccountType } from '../enums/account-type.enum';
import {
  DEFAULT_GENERAL_PREFS,
  DEFAULT_NOTIFICATION_PREFS,
  DEFAULT_PRIVACY_PREFS,
  GeneralPrefs,
  NotificationPrefs,
  PrivacyPrefs,
} from './user-preferences';

/**
 * Splits a display name into firstName/lastName the same way the
 * `add_first_last_name_and_rename_show_whatsapp` migration backfilled
 * existing rows: everything before the first space is the first name,
 * everything after is the last name. When there is no space, the whole
 * value becomes the first name and the last name falls back to a single
 * space (" ").
 */
function splitName(fullName: string): { firstName: string; lastName: string } {
  const trimmed = fullName.trim();
  const spaceIndex = trimmed.indexOf(' ');
  if (spaceIndex === -1) {
    return { firstName: trimmed, lastName: ' ' };
  }
  return {
    firstName: trimmed.slice(0, spaceIndex),
    lastName: trimmed.slice(spaceIndex + 1),
  };
}

export interface ProfileCompletion {
  pct: number;
  missing: string[];
}

interface CompletionRule {
  key: string;
  weight: number;
  met: boolean;
}

export interface UserProfileChanges {
  name?: string;
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

export class User {
  private constructor(
    private readonly _id: string,
    private _email: string,
    private _pendingEmail: string | null,
    private _emailVerified: boolean,
    private _passwordHash: string,
    private _name: string,
    private _firstName: string,
    private _lastName: string,
    private _username: string | null,
    private readonly _role: Role,
    private _accountType: AccountType,
    private _avatarUrl: string | null,
    private _bio: string | null,
    private _city: string | null,
    private _state: string | null,
    private _website: string | null,
    private _phone: string | null,
    private _altPhone: string | null,
    private _phoneVerified: boolean,
    private _showWhatsapp: boolean,
    private _allowCalls: boolean,
    private _showEmail: boolean,
    private _notificationPrefs: NotificationPrefs,
    private _privacyPrefs: PrivacyPrefs,
    private _generalPrefs: GeneralPrefs,
    private _twoFactorEnabled: boolean,
    private _deactivatedAt: Date | null,
    private readonly _createdAt: Date,
  ) {}

  static create(params: {
    email: string;
    passwordHash: string;
    name: string;
    role: Role;
    phone?: string | null;
  }): User {
    const { firstName, lastName } = splitName(params.name);
    return new User(
      randomUUID(),
      params.email,
      null,
      false,
      params.passwordHash,
      params.name,
      firstName,
      lastName,
      null,
      params.role,
      params.role === Role.ADMIN ? AccountType.OWNER : AccountType.CLIENT,
      null,
      null,
      null,
      null,
      null,
      params.phone ?? null,
      null,
      false,
      false,
      false,
      false,
      DEFAULT_NOTIFICATION_PREFS,
      DEFAULT_PRIVACY_PREFS,
      DEFAULT_GENERAL_PREFS,
      false,
      null,
      new Date(),
    );
  }

  static reconstitute(params: {
    id: string;
    email: string;
    pendingEmail: string | null;
    emailVerified: boolean;
    passwordHash: string;
    name: string;
    firstName: string;
    lastName: string;
    username: string | null;
    role: Role;
    accountType: AccountType;
    avatarUrl: string | null;
    bio: string | null;
    city: string | null;
    state: string | null;
    website: string | null;
    phone: string | null;
    altPhone: string | null;
    phoneVerified: boolean;
    showWhatsapp: boolean;
    allowCalls: boolean;
    showEmail: boolean;
    notificationPrefs: NotificationPrefs | null;
    privacyPrefs: PrivacyPrefs | null;
    generalPrefs: GeneralPrefs | null;
    twoFactorEnabled: boolean;
    deactivatedAt: Date | null;
    createdAt: Date;
  }): User {
    return new User(
      params.id,
      params.email,
      params.pendingEmail,
      params.emailVerified,
      params.passwordHash,
      params.name,
      params.firstName,
      params.lastName,
      params.username,
      params.role,
      params.accountType,
      params.avatarUrl,
      params.bio,
      params.city,
      params.state,
      params.website,
      params.phone,
      params.altPhone,
      params.phoneVerified,
      params.showWhatsapp,
      params.allowCalls,
      params.showEmail,
      params.notificationPrefs ?? DEFAULT_NOTIFICATION_PREFS,
      params.privacyPrefs ?? DEFAULT_PRIVACY_PREFS,
      params.generalPrefs ?? DEFAULT_GENERAL_PREFS,
      params.twoFactorEnabled,
      params.deactivatedAt,
      params.createdAt,
    );
  }

  updateProfile(changes: UserProfileChanges): void {
    if (changes.name !== undefined) this._name = changes.name;
    if (changes.firstName !== undefined) this._firstName = changes.firstName;
    if (changes.lastName !== undefined) this._lastName = changes.lastName;
    if (changes.username !== undefined) this._username = changes.username;
    if (changes.accountType !== undefined)
      this._accountType = changes.accountType;
    if (changes.avatarUrl !== undefined) this._avatarUrl = changes.avatarUrl;
    if (changes.bio !== undefined) this._bio = changes.bio;
    if (changes.city !== undefined) this._city = changes.city;
    if (changes.state !== undefined) this._state = changes.state;
    if (changes.website !== undefined) this._website = changes.website;
    if (changes.phone !== undefined) this._phone = changes.phone;
    if (changes.altPhone !== undefined) this._altPhone = changes.altPhone;
    if (changes.showWhatsapp !== undefined) {
      this._showWhatsapp = changes.showWhatsapp;
    }
    if (changes.allowCalls !== undefined) this._allowCalls = changes.allowCalls;
    if (changes.showEmail !== undefined) this._showEmail = changes.showEmail;
    if (changes.notificationPrefs !== undefined) {
      this._notificationPrefs = changes.notificationPrefs;
    }
    if (changes.privacyPrefs !== undefined)
      this._privacyPrefs = changes.privacyPrefs;
    if (changes.generalPrefs !== undefined)
      this._generalPrefs = changes.generalPrefs;
    if (changes.twoFactorEnabled !== undefined) {
      this._twoFactorEnabled = changes.twoFactorEnabled;
    }
  }

  requestEmailChange(pendingEmail: string): void {
    this._pendingEmail = pendingEmail;
  }

  confirmEmailChange(): void {
    if (!this._pendingEmail) return;
    this._email = this._pendingEmail;
    this._pendingEmail = null;
    this._emailVerified = true;
  }

  markEmailVerified(): void {
    this._emailVerified = true;
  }

  markPhoneVerified(): void {
    this._phoneVerified = true;
  }

  setPasswordHash(passwordHash: string): void {
    this._passwordHash = passwordHash;
  }

  deactivate(): void {
    this._deactivatedAt = new Date();
  }

  reactivate(): void {
    this._deactivatedAt = null;
  }

  get id(): string {
    return this._id;
  }

  get email(): string {
    return this._email;
  }

  get pendingEmail(): string | null {
    return this._pendingEmail;
  }

  get emailVerified(): boolean {
    return this._emailVerified;
  }

  get passwordHash(): string {
    return this._passwordHash;
  }

  get name(): string {
    return this._name;
  }

  get firstName(): string {
    return this._firstName;
  }

  get lastName(): string {
    return this._lastName;
  }

  get username(): string | null {
    return this._username;
  }

  get role(): Role {
    return this._role;
  }

  get accountType(): AccountType {
    return this._accountType;
  }

  get avatarUrl(): string | null {
    return this._avatarUrl;
  }

  get bio(): string | null {
    return this._bio;
  }

  get city(): string | null {
    return this._city;
  }

  get state(): string | null {
    return this._state;
  }

  get website(): string | null {
    return this._website;
  }

  get phone(): string | null {
    return this._phone;
  }

  get altPhone(): string | null {
    return this._altPhone;
  }

  get phoneVerified(): boolean {
    return this._phoneVerified;
  }

  get showWhatsapp(): boolean {
    return this._showWhatsapp;
  }

  get allowCalls(): boolean {
    return this._allowCalls;
  }

  get showEmail(): boolean {
    return this._showEmail;
  }

  get notificationPrefs(): NotificationPrefs {
    return this._notificationPrefs;
  }

  get privacyPrefs(): PrivacyPrefs {
    return this._privacyPrefs;
  }

  get generalPrefs(): GeneralPrefs {
    return this._generalPrefs;
  }

  get twoFactorEnabled(): boolean {
    return this._twoFactorEnabled;
  }

  get deactivatedAt(): Date | null {
    return this._deactivatedAt;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  /**
   * Weighted profile completion: a 0-100 percentage plus the list of
   * missing items sorted heaviest-first, so the frontend can surface the
   * top N nudges. Weights sum to 100.
   */
  get completion(): ProfileCompletion {
    const rules: CompletionRule[] = [
      { key: 'avatar', weight: 25, met: !!this._avatarUrl },
      {
        key: 'displayName',
        weight: 15,
        met: this._name.trim().length >= 3,
      },
      {
        key: 'bio',
        weight: 15,
        met: !!this._bio && this._bio.trim().length >= 30,
      },
      { key: 'phone', weight: 15, met: !!this._phone },
      { key: 'username', weight: 10, met: !!this._username },
      { key: 'location', weight: 10, met: !!this._city && !!this._state },
      { key: 'email', weight: 10, met: this._emailVerified === true },
    ];

    let pct = 0;
    const missing: CompletionRule[] = [];
    for (const rule of rules) {
      if (rule.met) {
        pct += rule.weight;
      } else {
        missing.push(rule);
      }
    }
    missing.sort((a, b) => b.weight - a.weight);

    return {
      pct: Math.min(100, pct),
      missing: missing.map((rule) => rule.key),
    };
  }
}
