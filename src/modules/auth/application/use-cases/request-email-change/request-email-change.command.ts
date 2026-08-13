export class RequestEmailChangeCommand {
  constructor(
    readonly userId: string,
    readonly newEmail: string,
  ) {}
}
