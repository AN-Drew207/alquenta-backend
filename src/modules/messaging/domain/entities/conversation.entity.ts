import { randomUUID } from 'node:crypto';

export class Conversation {
  private constructor(
    private readonly _id: string,
    private readonly _propertyId: string,
    private readonly _clientId: string,
    private readonly _adminId: string,
    private readonly _createdAt: Date,
  ) {}

  static create(params: {
    propertyId: string;
    clientId: string;
    adminId: string;
  }): Conversation {
    return new Conversation(
      randomUUID(),
      params.propertyId,
      params.clientId,
      params.adminId,
      new Date(),
    );
  }

  static reconstitute(params: {
    id: string;
    propertyId: string;
    clientId: string;
    adminId: string;
    createdAt: Date;
  }): Conversation {
    return new Conversation(
      params.id,
      params.propertyId,
      params.clientId,
      params.adminId,
      params.createdAt,
    );
  }

  hasParticipant(userId: string): boolean {
    return this._clientId === userId || this._adminId === userId;
  }

  otherParticipant(userId: string): string {
    return this._clientId === userId ? this._adminId : this._clientId;
  }

  get id(): string {
    return this._id;
  }

  get propertyId(): string {
    return this._propertyId;
  }

  get clientId(): string {
    return this._clientId;
  }

  get adminId(): string {
    return this._adminId;
  }

  get createdAt(): Date {
    return this._createdAt;
  }
}
