import posthog from 'posthog-js';
import { amiBucket, countBucket, matchBucket } from '@/lib/buckets';

/**
 * Client analytics helpers. We keep the app's existing event names (they're
 * already flowing) and use this module for the newer events that weren't
 * instrumented before. Bucketing lives in ./buckets (pure, shared with the
 * server) so no raw income / exact counts / addresses ever reach PostHog.
 */

export { amiBucket, countBucket, matchBucket };

interface EligibilityInput {
  amiPct: number | null;
  householdSize: number | null;
  matchCount: number;
  topScore: number | null;
  hasVoucher: boolean;
  /** Public geography (municipality) is fine to send; 'any' when unspecified. */
  municipality: string;
}

export const analytics = {
  /**
   * Fired once when a household's personalized matches are computed. This is
   * the event that powers the funnel end-cap and the zero-match cohort —
   * everything is bucketed, nothing raw.
   */
  eligibilityCalculated: (d: EligibilityInput) =>
    posthog.capture('eligibility_calculated', {
      ami_bucket: d.amiPct != null ? amiBucket(d.amiPct) : 'unknown',
      household_size_bucket: d.householdSize != null ? countBucket(d.householdSize) : 'unknown',
      match_bucket: matchBucket(d.matchCount),
      top_score: d.topScore != null ? Math.round(d.topScore) : null,
      has_voucher: d.hasVoucher,
      municipality: d.municipality,
    }),

  /** Current distinct id, to pass to server-side events so they stitch onto
   * the same session/person. */
  getDistinctId: (): string | undefined => posthog.get_distinct_id(),
};
