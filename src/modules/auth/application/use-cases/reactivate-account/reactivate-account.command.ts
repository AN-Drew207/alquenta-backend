export class ReactivateAccountCommand {
  constructor(
    readonly email: string,
    readonly password: string,
  ) {}
}
