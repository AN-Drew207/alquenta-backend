export class GetPropertyAnalyticsSummaryCommand {
  constructor(
    readonly propertyId: string,
    readonly adminId: string,
  ) {}
}
