import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../../shared/application/use-case.interface';
import { EntityNotFoundException } from '../../../../../shared/domain/exceptions/entity-not-found.exception';
import { PropertyRepository } from '../../../../properties/domain/repositories/property.repository';
import { PlanTier } from '../../../../plans/domain/enums/plan-tier.enum';
import {
  PropertyAnalyticsDailyCount,
  PropertyAnalyticsEventRepository,
} from '../../../domain/repositories/property-analytics-event.repository';
import { AnalyticsAccessDeniedException } from '../../../domain/exceptions/analytics-access-denied.exception';
import { AssertAnalyticsAccessUseCase } from '../assert-analytics-access/assert-analytics-access.use-case';
import { GetPropertyAnalyticsTrendCommand } from './get-property-analytics-trend.command';

export interface PropertyAnalyticsTrendPoint {
  /** ISO calendar date (UTC), e.g. "2026-08-18". */
  day: string;
  viewCount: number;
  contactCount: number;
}

/**
 * Trend window length, keyed by tier — PROFESSIONAL sees the last 30 days,
 * BUSINESS the last 90. A tier with no entry here (ENTERPRISE, or any
 * future tier added above it) gets full history: meetsMinimumTier(
 * PROFESSIONAL) in the shared gate already guarantees STARTER never reaches
 * this map, so the "no bound" fallback only ever applies to ENTERPRISE.
 */
const TREND_WINDOW_DAYS: Partial<Record<PlanTier, number>> = {
  [PlanTier.PROFESSIONAL]: 30,
  [PlanTier.BUSINESS]: 90,
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Daily-bucketed view/contact trend for one property (PROFESSIONAL+,
 * ownership-checked, same pattern as GetPropertyAnalyticsSummaryUseCase).
 * The repository only returns days that have at least one event — bounded
 * windows (PROFESSIONAL/BUSINESS) are gap-filled here with zero-count days
 * so a chart renders a continuous series; ENTERPRISE's unbounded history
 * has no natural start to fill from, so it returns exactly the days with
 * data.
 */
@Injectable()
export class GetPropertyAnalyticsTrendUseCase implements UseCase<
  GetPropertyAnalyticsTrendCommand,
  PropertyAnalyticsTrendPoint[]
> {
  constructor(
    private readonly propertyRepository: PropertyRepository,
    private readonly analyticsEventRepository: PropertyAnalyticsEventRepository,
    private readonly assertAnalyticsAccessUseCase: AssertAnalyticsAccessUseCase,
  ) {}

  async execute(
    command: GetPropertyAnalyticsTrendCommand,
  ): Promise<PropertyAnalyticsTrendPoint[]> {
    const plan = await this.assertAnalyticsAccessUseCase.execute({
      adminId: command.adminId,
      minimumTier: PlanTier.PROFESSIONAL,
    });

    const property = await this.propertyRepository.findById(command.propertyId);
    if (!property) {
      throw new EntityNotFoundException('Property', command.propertyId);
    }
    if (!property.belongsTo(command.adminId)) {
      throw new AnalyticsAccessDeniedException(
        `Property "${command.propertyId}" does not belong to the authenticated admin`,
      );
    }

    const since = resolveWindowStart(plan.tier);
    const rows =
      await this.analyticsEventRepository.countByPropertyGroupedByDay(
        property.id,
        since,
      );
    return toDayOrderedSeries(rows, since);
  }
}

function resolveWindowStart(tier: PlanTier): Date | null {
  const days = TREND_WINDOW_DAYS[tier];
  if (days === undefined) return null;
  return new Date(Date.now() - days * MS_PER_DAY);
}

function toDayOrderedSeries(
  rows: PropertyAnalyticsDailyCount[],
  since: Date | null,
): PropertyAnalyticsTrendPoint[] {
  if (since === null) {
    return rows
      .map((row) => ({
        day: toIsoDate(row.day),
        viewCount: row.viewCount,
        contactCount: row.contactCount,
      }))
      .sort((a, b) => (a.day < b.day ? -1 : a.day > b.day ? 1 : 0));
  }

  const byDay = new Map(rows.map((row) => [toIsoDate(row.day), row]));
  const points: PropertyAnalyticsTrendPoint[] = [];
  const cursor = startOfUtcDay(since);
  const end = startOfUtcDay(new Date());
  while (cursor.getTime() <= end.getTime()) {
    const key = toIsoDate(cursor);
    const existing = byDay.get(key);
    points.push({
      day: key,
      viewCount: existing?.viewCount ?? 0,
      contactCount: existing?.contactCount ?? 0,
    });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return points;
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}
