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

export interface UserProfileChanges {
  name?: string;
  username?: string | null;
  accountType?: AccountType;
  avatarUrl?: string | null;
  bio?: string | null;
  city?: string | null;
  state?: string | null;
  website?: string | null;
  phone?: string | null;
  altPhone?: string | null;
  showPhoneOnListings?: boolean;
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
    private _showPhoneOnListings: boolean,
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
    return new User(
      randomUUID(),
      params.email,
      null,
      false,
      params.passwordHash,
      params.name,
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
    showPhoneOnListings: boolean;
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
      params.showPhoneOnListings,
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
    if (changes.username !== undefined) this._username = changes.username;
    if (changes.accountType !== undefined) this._accountType = changes.accountType;
    if (changes.avatarUrl !== undefined) this._avatarUrl = changes.avatarUrl;
    if (changes.bio !== undefined) this._bio = changes.bio;
    if (changes.city !== undefined) this._city = changes.city;
    if (changes.state !== undefined) this._state = changes.state;
    if (changes.website !== undefined) this._website = changes.website;
    if (changes.phone !== undefined) this._phone = changes.phone;
    if (changes.altPhone !== undefined) this._altPhone = changes.altPhone;
    if (changes.showPhoneOnListings !== undefined) {
      this._showPhoneOnListings = changes.showPhoneOnListings;
    }
    if (changes.allowCalls !== undefined) this._allowCalls = changes.allowCalls;
    if (changes.showEmail !== undefined) this._showEmail = changes.showEmail;
    if (changes.notificationPrefs !== undefined) {
      this._notificationPrefs = changes.notificationPrefs;
    }
    if (changes.privacyPrefs !== undefined) this._privacyPrefs = changes.privacyPrefs;
    if (changes.generalPrefs !== undefined) this._generalPrefs = changes.generalPrefs;
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

  get showPhoneOnListings(): boolean {
    return this._showPhoneOnListings;
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

  /** Weighted profile completeness, 0-100. */
  get completeness(): number {
    let score = 0;
    if (this._avatarUrl) score += 20;
    if (this._name.trim().length > 0) score += 15;
    if (this._bio && this._bio.trim().length > 0) score += 15;
    if (this._city && this._state) score += 10;
    if (this._accountType) score += 10;
    if (this._emailVerified) score += 15;
    if (this._phoneVerified) score += 15;
    return Math.min(100, score);
  }
}
