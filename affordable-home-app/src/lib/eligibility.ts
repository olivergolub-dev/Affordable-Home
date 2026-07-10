import { eligibleBands, percentOfMedian, type AmiBand } from './incomeLimits';
import type { BedroomToken, Listing, WizardAnswers } from './types';

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
  return listing.bedroom_types.includes(bedrooms);
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

    const income = incomeMatches(listing, answers);
    if (!income.ok) continue;

    const reasons: string[] = [];

    if (answers.income != null && answers.householdSize != null && income.bands.length > 0) {
      const pct = percentOfMedian(answers.income, answers.householdSize);
      reasons.push(`Income-eligible (you're ~${pct}% of area median)`);
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
