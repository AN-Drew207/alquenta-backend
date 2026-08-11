export class ReplyToConversationCommand {
  constructor(
    readonly conversationId: string,
    readonly authorId: string,
    readonly content: string,
  ) {}
}
