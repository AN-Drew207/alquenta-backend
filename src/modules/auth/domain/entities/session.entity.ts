import { randomUUID } from 'node:crypto';

export class Session {
  private constructor(
    private readonly _id: string,
    private readonly _userId: string,
    private readonly _userAgent: string | null,
    private readonly _ip: string | null,
    private readonly _createdAt: Date,
    private _lastActiveAt: Date,
  ) {}

  static create(params: {
    userId: string;
    userAgent?: string | null;
    ip?: string | null;
  }): Session {
    const now = new Date();
    return new Session(
      randomUUID(),
      params.userId,
      params.userAgent ?? null,
      params.ip ?? null,
      now,
      now,
    );
  }

  static reconstitute(params: {
    id: string;
    userId: string;
    userAgent: string | null;
    ip: string | null;
    createdAt: Date;
    lastActiveAt: Date;
  }): Session {
    return new Session(
      params.id,
      params.userId,
      params.userAgent,
      params.ip,
      params.createdAt,
      params.lastActiveAt,
    );
  }

  touch(): void {
    this._lastActiveAt = new Date();
  }

  get id(): string {
    return this._id;
  }

  get userId(): string {
    return this._userId;
  }

  get userAgent(): string | null {
    return this._userAgent;
  }

  get ip(): string | null {
    return this._ip;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get lastActiveAt(): Date {
    return this._lastActiveAt;
  }
}
