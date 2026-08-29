export class EnableAgentCommand {
  constructor(
    readonly agentId: string,
    readonly parentAdminId: string,
  ) {}
}
