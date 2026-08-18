export class AddFavoriteCommand {
  constructor(
    readonly userId: string,
    readonly propertyId: string,
  ) {}
}
