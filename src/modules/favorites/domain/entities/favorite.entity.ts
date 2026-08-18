import { randomUUID } from 'node:crypto';

export class Favorite {
  private constructor(
    private readonly _id: string,
    private readonly _userId: string,
    private readonly _propertyId: string,
    private readonly _createdAt: Date,
  ) {}

  static create(params: { userId: string; propertyId: string }): Favorite {
    return new Favorite(randomUUID(), params.userId, params.propertyId, new Date());
  }

  static reconstitute(params: {
    id: string;
    userId: string;
    propertyId: string;
    createdAt: Date;
  }): Favorite {
    return new Favorite(params.id, params.userId, params.propertyId, params.createdAt);
  }

  get id(): string {
    return this._id;
  }

  get userId(): string {
    return this._userId;
  }

  get propertyId(): string {
    return this._propertyId;
  }

  get createdAt(): Date {
    return this._createdAt;
  }
}
