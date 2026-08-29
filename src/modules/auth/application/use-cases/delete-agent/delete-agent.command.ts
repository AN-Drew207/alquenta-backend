export class DeleteAgentCommand {
  constructor(
    readonly agentId: string,
    readonly parentAdminId: string,
  ) {}
}
