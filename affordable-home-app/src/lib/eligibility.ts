import { eligibleBands, percentOfMedian, type AmiBand } from './incomeLimits';
import { BEDROOM_TOKENS, type BedroomToken, type Listing, type WizardAnswers } from './types';

/** HUD standard: rent above 30% of gross income is "cost-burdened". */
const RENT_BURDEN_RATIO = 0.3;
/** How far above the 30% target a listing can still appear before being excluded. */
const RENT_BURDEN_CUSHION = 1.5;

/** A listing paired with a fit score and an explanation of why it matched. */
export interface MatchResult {
  listing: Listing;
  /** 0–10 fit score, one decimal. Higher = better fit for this household. */
  score: number;
  /** Short reasons this listing fits the household, for display. */
  reasons: string[];
}

/** Normalize a town string for loose comparison. */
function norm(s: string): string {
  return s.trim().toLowerCase();
}

/** True if the user selected "any municipality" (or nothing). */
function wantsAnyTown(towns: string[]): boolean {
  return towns.length === 0 || towns.some((t) => norm(t).includes('any'));
}

function townMatches(listing: Listing, towns: string[]): boolean {
  if (wantsAnyTown(towns)) return true;
  return towns.some((t) => norm(listing.city).includes(norm(t)) || norm(t).includes(norm(listing.city)));
}

/** Income-eligibility: does the household qualify for any band this listing serves? */
function incomeMatches(listing: Listing, answers: WizardAnswers): { ok: boolean; bands: AmiBand[] } {
  // No income given → don't exclude on income.
  if (answers.income == null || answers.householdSize == null) {
    return { ok: true, bands: listing.ami_bands };
  }
  const userBands = new Set(eligibleBands(answers.income, answers.householdSize));
  const overlap = listing.ami_bands.filter((b) => userBands.has(b));
  return { ok: overlap.length > 0, bands: overlap };
}

function bedroomMatches(listing: Listing, bedrooms: BedroomToken | null): boolean {
  if (!bedrooms) return true;
  if (listing.bedroom_types.length === 0) return true;
  // '3BR' means "3 or more" (matches the wizard's "3+ bedrooms" option), so a
  // 4BR listing still satisfies it. Studio/1BR/2BR require an exact match.
  const wantedIdx = BEDROOM_TOKENS.indexOf(bedrooms);
  if (bedrooms === '3BR') {
    return listing.bedroom_types.some((t) => BEDROOM_TOKENS.indexOf(t) >= wantedIdx);
  }
  return listing.bedroom_types.includes(bedrooms);
}

/** Monthly rent a household can afford at the HUD 30%-of-income standard. */
function monthlyBudget(annualIncome: number | null): number | null {
  if (annualIncome == null || annualIncome <= 0) return null;
  return Math.round((annualIncome / 12) * RENT_BURDEN_RATIO);
}

/** True if this listing's program accepts / is a housing voucher. */
function acceptsVoucher(listing: Listing): boolean {
  return /voucher|section 8|hcv|pbv/i.test(listing.program_type ?? '');
}

/**
 * Fit score, 0–10 (one decimal). Weights (max, clamped to 10.0):
 *   Income eligibility ....... 3.0   (unknown income → 1.5 partial)
 *   Rent vs. budget .......... 2.0 within / 1.0 near / -1.0 over / 0.7 unknown
 *   Bedroom match ............ 1.5   (unknown/no-preference → 0.5)
 *   Priority-group match ..... 1.5
 *   Town match ............... 1.0   (no preference → 0.5)
 *   Baseline ................. 0.5
 *   Accessibility ............ 0.5, or 1.0 when a disability is marked
 *   Voucher (soft nudge) ..... 0.5 when the holder's voucher is accepted
 * Voucher is a soft signal only — it never hides a listing, so a voucher
 * holder still sees every unit they could apply to. Every returned listing is
 * already eligible; this only ranks good-fit above just-eligible, never gates.
 */
function scoreListing(listing: Listing, answers: WizardAnswers, eligibleBandOverlap: AmiBand[]): number {
  let score = 0.5; // baseline

  // Income eligibility — the heaviest factor.
  if (answers.income != null && answers.householdSize != null) {
    score += eligibleBandOverlap.length > 0 ? 3.0 : 0;
  } else {
    score += 1.5; // income unknown → partial confidence
  }

  // Rent vs. the household's 30%-of-income budget.
  const budget = monthlyBudget(answers.income);
  if (listing.rent != null && budget != null) {
    if (listing.rent <= budget) score += 2.0;
    else if (listing.rent <= budget * RENT_BURDEN_CUSHION) score += 1.0;
    else score -= 1.0; // significantly over budget
  } else {
    score += 0.7; // rent unknown ("contact for rent") is normal — mild credit
  }

  // Bedrooms.
  if (answers.bedrooms) {
    score += listing.bedroom_types.includes(answers.bedrooms) ? 1.5 : 0.5;
  } else {
    score += 0.5; // no preference
  }

  // Priority group (senior / veteran / disability / homeless).
  if (answers.priorityGroups.some((g) => listing.priority_groups.includes(g))) score += 1.5;

  // Location.
  if (!wantsAnyTown(answers.towns) && answers.towns.length > 0) {
    score += townMatches(listing, answers.towns) ? 1.0 : 0;
  } else {
    score += 0.5; // no town preference → half credit
  }

  // Accessibility — 0.5 in general, 1.0 when the household marked a disability.
  if (listing.accessible) {
    score += answers.priorityGroups.includes('disability') ? 1.0 : 0.5;
  }

  // Voucher — a soft nudge (never a filter): a voucher holder still sees every
  // eligible listing; voucher-accepting ones just rank slightly higher.
  if (answers.voucher === 'yes' && acceptsVoucher(listing)) score += 0.5;

  const clamped = Math.max(0, Math.min(10, score));
  return Math.round(clamped * 10) / 10;
}

/**
 * Core matching engine. Given the wizard answers, return the listings the
 * household is eligible for, each annotated with human-readable reasons.
 *
 * Filtering is inclusive by design: an unanswered question never narrows
 * results, and priority-group / voucher signals boost relevance rather than
 * exclude (so users aren't hidden from programs they could still apply to).
 */
export function matchListings(listings: Listing[], answers: WizardAnswers): MatchResult[] {
  const results: MatchResult[] = [];

  for (const listing of listings) {
    if (!townMatches(listing, answers.towns)) continue;
    if (!bedroomMatches(listing, answers.bedrooms)) continue;
    // Rent is no longer a hard filter: significantly over-budget listings still
    // appear but take a -1.0 scoring penalty (see scoreListing), so they sink
    // to the bottom rather than being hidden entirely.

    const income = incomeMatches(listing, answers);
    if (!income.ok) continue;

    const reasons: string[] = [];

    if (answers.income != null && answers.householdSize != null && income.bands.length > 0) {
      const pct = percentOfMedian(answers.income, answers.householdSize);
      reasons.push(`Income-eligible (you're ~${pct}% of area median)`);
    }
    if (listing.rent != null && answers.income != null) {
      const budget = monthlyBudget(answers.income);
      if (budget != null && listing.rent <= budget) reasons.push('Within your rent budget');
    }
    if (!wantsAnyTown(answers.towns) && answers.towns.length > 0) {
      reasons.push(`In ${listing.city}`);
    }
    if (
      answers.priorityGroups.length > 0 &&
      listing.priority_groups.some((g) => answers.priorityGroups.includes(g))
    ) {
      reasons.push('Prioritizes your household');
    }
    if (answers.voucher === 'yes' && acceptsVoucher(listing)) {
      reasons.push('Accepts your voucher');
    }

    const score = scoreListing(listing, answers, income.bands);
    results.push({ listing, score, reasons });
  }

  // Rank by fit score, best first. Ties fall back to more matched reasons.
  results.sort((a, b) => b.score - a.score || b.reasons.length - a.reasons.length);

  return results;
}
