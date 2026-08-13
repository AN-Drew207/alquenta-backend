import { randomUUID } from 'node:crypto';
import { Role } from '../../../../shared/domain/role.enum';

export class User {
  private constructor(
    private readonly _id: string,
    private readonly _email: string,
    private readonly _passwordHash: string,
    private readonly _name: string,
    private readonly _role: Role,
    private _phone: string | null,
    private _showPhoneOnListings: boolean,
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
      params.passwordHash,
      params.name,
      params.role,
      params.phone ?? null,
      false,
    );
  }

  static reconstitute(params: {
    id: string;
    email: string;
    passwordHash: string;
    name: string;
    role: Role;
    phone: string | null;
    showPhoneOnListings: boolean;
  }): User {
    return new User(
      params.id,
      params.email,
      params.passwordHash,
      params.name,
      params.role,
      params.phone,
      params.showPhoneOnListings,
    );
  }

  updateProfile(changes: {
    phone?: string | null;
    showPhoneOnListings?: boolean;
  }): void {
    if (changes.phone !== undefined) this._phone = changes.phone;
    if (changes.showPhoneOnListings !== undefined) {
      this._showPhoneOnListings = changes.showPhoneOnListings;
    }
  }

  get id(): string {
    return this._id;
  }

  get email(): string {
    return this._email;
  }

  get passwordHash(): string {
    return this._passwordHash;
  }

  get name(): string {
    return this._name;
  }

  get role(): Role {
    return this._role;
  }

  get phone(): string | null {
    return this._phone;
  }

  get showPhoneOnListings(): boolean {
    return this._showPhoneOnListings;
  }
}
