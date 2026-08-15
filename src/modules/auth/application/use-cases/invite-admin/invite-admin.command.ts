export class InviteAdminCommand {
  constructor(
    readonly email: string,
    readonly planId: string,
  ) {}
}
