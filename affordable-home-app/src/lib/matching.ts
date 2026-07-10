// Shared eligibility + ranking logic for Home Reach listings.
// Used by both the Results page (client) and the email route (server) so the
// matches a user sees on screen are the same ones we email them.
//
// Every check is null-safe: an unknown/blank field never excludes a listing,
// so filtering keeps working whether or not a column (rent, bedrooms, etc.)
// is populated.

export const TABLE_NAME = 'Affordable Home';

export interface Listing {
  name: string;
  city: string | null;
  bedrooms: number | string | null;
  rent: number | string | null;
  ami_band: string | null;
  voucher_accepted: boolean | string | null;
  accessibility: boolean | string | null;
  program_type: string | null;
  application_link: string | null;
  wailist_open: boolean | string | null;
  notes?: string | null;
}

export interface WizardAnswers {
  income?: string;
  householdSize?: string;
  bedrooms?: string;
  towns?: string[];
  voucher?: string;
  circumstances?: string[];
}

// Share of gross income considered "affordable" for rent (HUD 30% standard).
const RENT_BURDEN = 0.3;
// How far above the 30% target we still show a listing before excluding it.
const RENT_CUSHION = 1.5;

function truthy(v: boolean | string | null | undefined): boolean {
  return v === true || String(v) === 'true';
}

// waitlist_open is inverted in this dataset: false === currently open/available.
export function isOpen(listing: Listing): boolean {
  return listing.wailist_open === false || String(listing.wailist_open) === 'false';
}

/* ---------------------------------- Income / AMI --------------------------------- */

// Map annual household income to the AMI tier (%) it qualifies for.
// Thresholds are Essex County, NJ 1-person limits from the NJHMFA guide.
export function getUserAmiTier(incomeStr?: string): number | null {
  const income = parseInt(String(incomeStr ?? '').replace(/[^0-9]/g, ''), 10);
  if (!income) return null;
  if (income <= 30450) return 30;
  if (income <= 50750) return 50;
  if (income <= 60900) return 60;
  if (income <= 81200) return 80;
  return null;
}

// The highest AMI percentage a listing serves, parsed from strings like
// "60% AMI", "30-50% AMI", "50-60% AMI". Returns null if unparseable.
export function bandCeiling(band?: string | null): number | null {
  if (!band) return null;
  const nums = String(band).match(/\d+/g);
  if (!nums || nums.length === 0) return null;
  return Math.max(...nums.map(Number));
}

// Is a household income-eligible for this listing?
// A household at tier T qualifies for any unit whose band ceiling is >= T
// (a 30% household also qualifies for 50/60/80% units).
export function isAmiEligible(listing: Listing, answers: WizardAnswers): boolean {
  const tier = getUserAmiTier(answers.income);
  const ceiling = bandCeiling(listing.ami_band);
  if (tier == null || ceiling == null) return true; // unknown -> don't exclude
  return tier <= ceiling;
}

/* ---------------------------------- Location --------------------------------- */

export function matchesTown(listing: Listing, answers: WizardAnswers): boolean {
  const towns = answers.towns ?? [];
  if (towns.length === 0 || towns.some((t) => /any/i.test(t))) return true;
  const city = (listing.city ?? '').toLowerCase();
  if (!city) return true; // unknown city -> don't exclude
  return towns.some((t) => city.includes(t.toLowerCase()));
}

/* ---------------------------------- Bedrooms --------------------------------- */

// Normalize any bedroom representation to a canonical count.
// Studio -> 0, "1 bedroom"/"1BR"/1 -> 1, ... "3+ bedrooms"/"3BR+"/4 -> 3 (means 3+).
// Returns null for "All"/"Any"/blank/unknown (i.e. no preference / unknown).
export function normalizeBedrooms(value?: number | string | null): number | null {
  if (value == null) return null;
  const s = String(value).trim().toLowerCase();
  if (s === '' || s === 'all' || s === 'any') return null;
  if (s.includes('studio') || s === '0') return 0;
  const m = s.match(/\d+/);
  if (!m) return null;
  const n = parseInt(m[0], 10);
  if (Number.isNaN(n)) return null;
  return n >= 3 ? 3 : n; // 3 is treated as "3+"
}

export function bedroomsMatch(listing: Listing, answers: WizardAnswers): boolean {
  const wanted = normalizeBedrooms(answers.bedrooms);
  const have = normalizeBedrooms(listing.bedrooms);
  if (wanted == null || have == null) return true; // no preference or unknown data
  if (wanted >= 3) return have >= 3; // "3+" wanted -> any 3+ unit
  if (have >= 3) return false;       // 3+ unit can't satisfy a specific smaller need
  return have === wanted;
}

/* ---------------------------------- Rent / affordability --------------------------------- */

// Parse a rent value into a monthly dollar number, or null if unknown.
// Handles numbers, "$1,200/mo", "1200", and "Contact for rent" -> null.
export function parseRent(value?: number | string | null): number | null {
  if (value == null) return null;
  if (typeof value === 'number') return value > 0 ? value : null;
  const s = String(value).toLowerCase();
  if (s.includes('contact') || s.trim() === '') return null;
  const digits = s.replace(/[^0-9.]/g, '');
  if (digits === '') return null;
  const n = Math.round(parseFloat(digits));
  return Number.isNaN(n) || n <= 0 ? null : n;
}

// Monthly rent a household can afford at the 30% standard, or null if no income.
export function monthlyBudget(incomeStr?: string): number | null {
  const annual = parseInt(String(incomeStr ?? '').replace(/[^0-9]/g, ''), 10);
  if (!annual) return null;
  return Math.round((annual / 12) * RENT_BURDEN);
}

// Affordable unless rent is clearly out of reach. Unknown rent/income -> keep.
export function isRentAffordable(listing: Listing, answers: WizardAnswers): boolean {
  const rent = parseRent(listing.rent);
  const budget = monthlyBudget(answers.income);
  if (rent == null || budget == null) return true;
  return rent <= budget * RENT_CUSHION;
}

/* ---------------------------------- Combine --------------------------------- */

// Hard eligibility gate: income tier + location + bedrooms + affordability.
export function isEligible(listing: Listing, answers: WizardAnswers): boolean {
  return (
    isAmiEligible(listing, answers) &&
    matchesTown(listing, answers) &&
    bedroomsMatch(listing, answers) &&
    isRentAffordable(listing, answers)
  );
}

// Higher score = better match. Used to order eligible listings.
export function relevanceScore(listing: Listing, answers: WizardAnswers): number {
  let score = 0;
  // Voucher holder + listing accepts vouchers is the strongest signal.
  if (/yes/i.test(String(answers.voucher ?? '')) && truthy(listing.voucher_accepted)) score += 4;
  // Currently-open listings beat waitlist-only.
  if (isOpen(listing)) score += 2;
  // A specific town match (not "any") is more relevant than a broad one.
  const towns = answers.towns ?? [];
  if (towns.length > 0 && !towns.some((t) => /any/i.test(t)) && matchesTown(listing, answers)) score += 1;
  // Comfortably within the 30% budget.
  const rent = parseRent(listing.rent);
  const budget = monthlyBudget(answers.income);
  if (rent != null && budget != null && rent <= budget) score += 2;
  // Exact bedroom match (both known) is a small boost over an unknown.
  if (normalizeBedrooms(answers.bedrooms) != null && normalizeBedrooms(listing.bedrooms) != null) score += 1;
  // Priority-group households: nudge accessible units up.
  const circ = answers.circumstances ?? [];
  if (circ.some((c) => /disabilit/i.test(c)) && truthy(listing.accessibility)) score += 2;
  return score;
}

// Full pipeline: keep eligible listings, sort best-first (score, then cheaper rent).
export function matchListings(listings: Listing[], answers: WizardAnswers): Listing[] {
  return listings
    .filter((l) => isEligible(l, answers))
    .sort((a, b) => {
      const byScore = relevanceScore(b, answers) - relevanceScore(a, answers);
      if (byScore !== 0) return byScore;
      const ra = parseRent(a.rent);
      const rb = parseRent(b.rent);
      if (ra != null && rb != null) return ra - rb; // cheaper first
      if (ra != null) return -1;
      if (rb != null) return 1;
      return 0;
    });
}
