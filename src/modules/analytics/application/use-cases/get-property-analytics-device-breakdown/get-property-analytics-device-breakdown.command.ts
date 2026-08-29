export class GetPropertyAnalyticsDeviceBreakdownCommand {
  constructor(
    readonly propertyId: string,
    readonly adminId: string,
  ) {}
}
