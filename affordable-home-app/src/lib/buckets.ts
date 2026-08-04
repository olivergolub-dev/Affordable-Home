/**
 * Pure bucketing helpers — no PostHog import, so they're safe to use on both
 * the client and the server. Raw income, exact household size, exact match
 * counts, and addresses NEVER go to analytics; only these coarse buckets do.
 */

/** % of area median income → HUD-style affordability tier. */
export function amiBucket(pct: number): string {
  if (pct <= 30) return 'ELI_0_30';
  if (pct <= 50) return 'VLI_31_50';
  if (pct <= 80) return 'LI_51_80';
  if (pct <= 120) return 'MOD_81_120';
  return 'ABOVE_120';
}

/** Small counts (e.g. household size) → coarse bucket. */
export function countBucket(n: number): string {
  if (n <= 1) return '1';
  if (n <= 2) return '2';
  if (n <= 4) return '3_4';
  return '5_plus';
}

/** Number of matched listings → bucket. '0' is kept distinct on purpose so the
 * zero-match cohort is easy to isolate. */
export function matchBucket(n: number): string {
  if (n === 0) return '0';
  if (n <= 3) return '1_3';
  if (n <= 10) return '4_10';
  return '10_plus';
}
