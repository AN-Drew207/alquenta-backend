export class RemoveFavoriteCommand {
  constructor(
    readonly userId: string,
    readonly propertyId: string,
  ) {}
}
