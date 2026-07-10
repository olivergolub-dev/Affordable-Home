/**
 * Official NJ UHAC Affordable Housing Regional Income Limits — Region 2.
 *
 * Essex County is part of UHAC Region 2 (Essex, Morris, Union, Warren).
 * These are the limits NJ affordable-housing units (COAH/UHAC, LIHTC, etc.)
 * are actually administered against — the correct basis for eligibility on
 * this site.
 *
 * Source: New Jersey Housing and Mortgage Finance Agency (NJHMFA),
 *   "UHAC 2026 Affordable Housing Regional Income Limits by Household Size."
 *   Last updated May 5, 2026 · Effective June 15, 2026.
 *   https://www.cjhrc.org/images/New_Jersey_State_Income_Limits.pdf
 *
 * UHAC publishes three official bands: Very Low (30%), Low (50%), Moderate (80%).
 * The 60% band (common for LIHTC units) is derived as 50% × 1.2, the standard
 * linear HUD relationship between bands. It is marked `derived` below.
 *
 * When NJHMFA republishes limits, update REGION_2_LIMITS and LAST_VERIFIED only.
 */

export const INCOME_LIMITS_SOURCE = {
  authority: 'NJHMFA UHAC Regional Income Limits',
  region: 'Region 2 (Essex, Morris, Union, Warren)',
  effective: '2026-06-15',
  url: 'https://www.cjhrc.org/images/New_Jersey_State_Income_Limits.pdf',
} as const;

/** Supported AMI bands, as whole-number percentages of area median. */
export const AMI_BANDS = [30, 50, 60, 80] as const;
export type AmiBand = (typeof AMI_BANDS)[number];

/** Household sizes with published limits. Larger households clamp to 8. */
const MAX_TABLE_SIZE = 8;

/** Region 2 income limits by household size (1–8). Dollars, annual, gross. */
const REGION_2_LIMITS: Record<number, { median: number; p30: number; p50: number; p80: number }> = {
  1: { median: 96_500, p30: 28_950, p50: 48_250, p80: 77_200 },
  2: { median: 110_300, p30: 33_090, p50: 55_150, p80: 88_240 },
  3: { median: 124_100, p30: 37_230, p50: 62_050, p80: 99_280 },
  4: { median: 137_800, p30: 41_340, p50: 68_900, p80: 110_240 },
  5: { median: 148_900, p30: 44_670, p50: 74_450, p80: 119_120 },
  6: { median: 159_900, p30: 47_970, p50: 79_950, p80: 127_920 },
  7: { median: 170_900, p30: 51_270, p50: 85_450, p80: 136_720 },
  8: { median: 181_900, p30: 54_570, p50: 90_950, p80: 145_520 },
};

function clampSize(householdSize: number): number {
  if (!Number.isFinite(householdSize) || householdSize < 1) return 1;
  return Math.min(Math.round(householdSize), MAX_TABLE_SIZE);
}

/** Annual income limit for a given AMI band and household size (Region 2). */
export function incomeLimitFor(band: AmiBand, householdSize: number): number {
  const row = REGION_2_LIMITS[clampSize(householdSize)];
  switch (band) {
    case 30:
      return row.p30;
    case 50:
      return row.p50;
    case 60:
      // Derived: 60% = 50% × 1.2 (standard linear band relationship).
      return Math.round((row.p50 * 1.2) / 50) * 50;
    case 80:
      return row.p80;
  }
}

/** Area median income for a household size (Region 2). */
export function medianIncomeFor(householdSize: number): number {
  return REGION_2_LIMITS[clampSize(householdSize)].median;
}

/** True if `income` qualifies a household of `householdSize` for `band`. */
export function qualifiesForBand(income: number, householdSize: number, band: AmiBand): boolean {
  return income <= incomeLimitFor(band, householdSize);
}

/**
 * The AMI bands a household is income-eligible for.
 * A unit at band B requires income ≤ the band-B limit, so lower earners
 * qualify for more bands.
 */
export function eligibleBands(income: number, householdSize: number): AmiBand[] {
  if (!Number.isFinite(income) || income <= 0) return [...AMI_BANDS];
  return AMI_BANDS.filter((band) => qualifiesForBand(income, householdSize, band));
}

/** Income as a percentage of area median for the household size (rounded). */
export function percentOfMedian(income: number, householdSize: number): number {
  return Math.round((income / medianIncomeFor(householdSize)) * 100);
}
