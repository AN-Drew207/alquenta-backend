export class ListConversationMessagesQuery {
  constructor(
    readonly conversationId: string,
    readonly requesterId: string,
  ) {}
}
