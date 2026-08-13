export class AcceptAdminInvitationCommand {
  constructor(
    readonly token: string,
    readonly name: string,
    readonly password: string,
  ) {}
}
