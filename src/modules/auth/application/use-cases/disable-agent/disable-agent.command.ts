export class DisableAgentCommand {
  constructor(
    readonly agentId: string,
    readonly parentAdminId: string,
  ) {}
}
