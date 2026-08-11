export class RegisterCommand {
  constructor(
    readonly email: string,
    readonly password: string,
    readonly name: string,
    readonly phone?: string,
  ) {}
}
