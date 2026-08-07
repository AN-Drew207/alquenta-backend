export class DeletePropertyCommand {
  constructor(
    readonly propertyId: string,
    readonly adminId: string,
  ) {}
}
