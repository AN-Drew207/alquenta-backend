import { randomUUID } from 'node:crypto';
import { NotificationType } from '../enums/notification-type.enum';
import { NotificationStatus } from '../enums/notification-status.enum';

export class Notification {
  private constructor(
    private readonly _id: string,
    private readonly _recipientUserId: string,
    private readonly _type: NotificationType,
    private readonly _messageId: string | null,
    private readonly _conversationId: string | null,
    private readonly _text: string,
    private _status: NotificationStatus,
    private readonly _createdAt: Date,
  ) {}

  static create(params: {
    recipientUserId: string;
    type: NotificationType;
    text: string;
    messageId?: string | null;
    conversationId?: string | null;
  }): Notification {
    return new Notification(
      randomUUID(),
      params.recipientUserId,
      params.type,
      params.messageId ?? null,
      params.conversationId ?? null,
      params.text,
      NotificationStatus.PENDING,
      new Date(),
    );
  }

  static reconstitute(params: {
    id: string;
    recipientUserId: string;
    type: NotificationType;
    messageId: string | null;
    conversationId: string | null;
    text: string;
    status: NotificationStatus;
    createdAt: Date;
  }): Notification {
    return new Notification(
      params.id,
      params.recipientUserId,
      params.type,
      params.messageId,
      params.conversationId,
      params.text,
      params.status,
      params.createdAt,
    );
  }

  belongsTo(userId: string): boolean {
    return this._recipientUserId === userId;
  }

  markAsRead(): void {
    this._status = NotificationStatus.READ;
  }

  get id(): string {
    return this._id;
  }

  get recipientUserId(): string {
    return this._recipientUserId;
  }

  get type(): NotificationType {
    return this._type;
  }

  get messageId(): string | null {
    return this._messageId;
  }

  get conversationId(): string | null {
    return this._conversationId;
  }

  get text(): string {
    return this._text;
  }

  get status(): NotificationStatus {
    return this._status;
  }

  get createdAt(): Date {
    return this._createdAt;
  }
}
