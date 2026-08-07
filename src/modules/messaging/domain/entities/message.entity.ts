import { randomUUID } from 'node:crypto';
import { InvalidOfferAmountException } from '../exceptions/invalid-offer-amount.exception';

export class Message {
  private constructor(
    private readonly _id: string,
    private readonly _conversationId: string,
    private readonly _authorId: string,
    private readonly _content: string,
    private readonly _offerAmount: number | null,
    private _read: boolean,
    private readonly _createdAt: Date,
  ) {}

  static create(params: {
    conversationId: string;
    authorId: string;
    content: string;
    offerAmount?: number | null;
  }): Message {
    if (params.offerAmount !== undefined && params.offerAmount !== null && params.offerAmount <= 0) {
      throw new InvalidOfferAmountException();
    }
    return new Message(
      randomUUID(),
      params.conversationId,
      params.authorId,
      params.content,
      params.offerAmount ?? null,
      false,
      new Date(),
    );
  }

  static reconstitute(params: {
    id: string;
    conversationId: string;
    authorId: string;
    content: string;
    offerAmount: number | null;
    read: boolean;
    createdAt: Date;
  }): Message {
    return new Message(
      params.id,
      params.conversationId,
      params.authorId,
      params.content,
      params.offerAmount,
      params.read,
      params.createdAt,
    );
  }

  markAsRead(): void {
    this._read = true;
  }

  get id(): string {
    return this._id;
  }

  get conversationId(): string {
    return this._conversationId;
  }

  get authorId(): string {
    return this._authorId;
  }

  get content(): string {
    return this._content;
  }

  get offerAmount(): number | null {
    return this._offerAmount;
  }

  get read(): boolean {
    return this._read;
  }

  get createdAt(): Date {
    return this._createdAt;
  }
}
