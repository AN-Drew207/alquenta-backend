import { PlanTier } from '../enums/plan-tier.enum';

export class Plan {
  private constructor(
    private readonly _id: string,
    private readonly _tier: PlanTier,
    private readonly _name: string,
    private readonly _monthlyPriceUsd: number,
    private readonly _activeListingsLimit: number | null,
    private readonly _createdAt: Date,
  ) {}

  static reconstitute(params: {
    id: string;
    tier: PlanTier;
    name: string;
    monthlyPriceUsd: number;
    activeListingsLimit: number | null;
    createdAt: Date;
  }): Plan {
    return new Plan(
      params.id,
      params.tier,
      params.name,
      params.monthlyPriceUsd,
      params.activeListingsLimit,
      params.createdAt,
    );
  }

  /** Whether adding one more active listing would exceed this plan's cap. */
  allowsAnotherActiveListing(currentActiveCount: number): boolean {
    if (this._activeListingsLimit === null) return true;
    return currentActiveCount < this._activeListingsLimit;
  }

  get id(): string {
    return this._id;
  }

  get tier(): PlanTier {
    return this._tier;
  }

  get name(): string {
    return this._name;
  }

  get monthlyPriceUsd(): number {
    return this._monthlyPriceUsd;
  }

  get activeListingsLimit(): number | null {
    return this._activeListingsLimit;
  }

  get createdAt(): Date {
    return this._createdAt;
  }
}
