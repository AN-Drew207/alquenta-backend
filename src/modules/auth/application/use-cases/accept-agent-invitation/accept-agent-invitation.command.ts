export class AcceptAgentInvitationCommand {
  constructor(
    readonly token: string,
    readonly name: string,
    readonly password: string,
  ) {}
}
