export class InviteAgentCommand {
  constructor(
    readonly email: string,
    readonly parentAdminId: string,
  ) {}
}
