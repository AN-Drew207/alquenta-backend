/**
 * Shared result shape for both the single-property and portfolio-wide
 * summary use-cases — Fase 1 is global counts only, no time windowing.
 */
export interface PropertyAnalyticsSummary {
  totalViews: number;
  totalContacts: number;
  conversionRate: number;
}
