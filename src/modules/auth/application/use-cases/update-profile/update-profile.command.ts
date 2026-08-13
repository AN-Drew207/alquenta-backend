export class UpdateProfileCommand {
  constructor(
    readonly userId: string,
    readonly phone?: string | null,
    readonly showPhoneOnListings?: boolean,
  ) {}
}
