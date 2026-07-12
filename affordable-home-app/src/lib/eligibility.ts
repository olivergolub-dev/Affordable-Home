import { eligibleBands, percentOfMedian, type AmiBand } from './incomeLimits';
import { BEDROOM_TOKENS, type BedroomToken, type Listing, type WizardAnswers } from './types';

/** HUD standard: rent above 30% of gross income is "cost-burdened". */
const RENT_BURDEN_RATIO = 0.3;
/** How far above the 30% target a listing can still appear before being excluded. */
const RENT_BURDEN_CUSHION = 1.5;

/** A listing paired with an explanation of why it matched. */
export interface MatchResult {
  listing: Listing;
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

/** Rent is affordable unless it's clearly out of reach. Unknown data never excludes. */
function rentIsAffordable(listing: Listing, answers: WizardAnswers): boolean {
  const budget = monthlyBudget(answers.income);
  if (listing.rent == null || budget == null) return true;
  return listing.rent <= budget * RENT_BURDEN_CUSHION;
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
    if (!rentIsAffordable(listing, answers)) continue;

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
    if (answers.voucher === 'yes' && /voucher|section 8|hcv|pbv/i.test(listing.program_type ?? '')) {
      reasons.push('Accepts your voucher');
    }
    if (listing.waitlist_open) {
      reasons.push('Waitlist open');
    }

    results.push({ listing, reasons });
  }

  // Rank: open waitlists first, then those with more matched reasons.
  results.sort((a, b) => {
    if (a.listing.waitlist_open !== b.listing.waitlist_open) {
      return a.listing.waitlist_open ? -1 : 1;
    }
    return b.reasons.length - a.reasons.length;
  });

  return results;
}
