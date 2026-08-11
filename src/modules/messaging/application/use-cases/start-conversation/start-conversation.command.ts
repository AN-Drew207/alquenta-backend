export class StartConversationCommand {
  constructor(
    readonly propertyId: string,
    readonly clientId: string,
    readonly content: string,
  ) {}
}
