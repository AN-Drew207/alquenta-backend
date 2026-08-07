export class ReplyToConversationCommand {
  constructor(
    readonly conversationId: string,
    readonly authorId: string,
    readonly content: string,
    readonly offerAmount?: number,
  ) {}
}
